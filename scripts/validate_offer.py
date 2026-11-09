#!/usr/bin/env python3
"""Offline offer contract, deliberately scoped to the two offer pages and llms.txt."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.facts = {}
        self.schemas = []
        self.active = None
        self.schema = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'data-offer-fact' in attrs:
            key = str(attrs['data-offer-fact'])
            if key in self.facts:
                raise ValueError('Duplicate fact marker: ' + key)
            self.active = (tag, key)
            self.facts[key] = ''
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.schema = ''

    def handle_data(self, data):
        if self.active:
            self.facts[self.active[1]] += data
        if self.schema is not None:
            self.schema += data

    def handle_endtag(self, tag):
        if self.active and self.active[0] == tag:
            self.active = None
        if tag == 'script' and self.schema is not None:
            self.schemas.append(json.loads(self.schema))
            self.schema = None


def validate(root=ROOT):
    f = json.loads((root / 'data/offer-facts.json').read_text())
    checks = 0
    def equal(actual, expected, label):
        nonlocal checks
        if actual != expected:
            raise ValueError(f'{label}: expected {expected!r}, got {actual!r}')
        checks += 1

    for filename in ['index.html', 'kosten-hermes-assistent/index.html']:
        source = (root / filename).read_text()
        page = Page(source)
        services = [n for g in page.schemas for n in g.get('@graph', [g]) if n.get('@type') == 'Service']
        equal(len(services), 1, filename + ' Service count')
        service = services[0]
        for key in ['name', 'description', 'serviceType', 'url']:
            equal(service[key], f[key], filename + ': ' + key)
        equal(service['audience'], {'@type': 'Audience', 'audienceType': f['audience']}, 'audience')
        equal(service['termsOfService'], f['terms'], 'service terms')
        offer = service['offers']
        equal(offer['@type'], 'Offer', 'Offer type')
        for key, fact in [('name', 'name'), ('url', 'url'), ('description', 'terms'), ('price', 'price'), ('priceCurrency', 'currency')]:
            equal(offer[key], f[fact], 'Offer ' + key)
        equal(offer['priceSpecification'], {'@type': 'PriceSpecification', 'price': f['price'], 'priceCurrency': f['currency'], 'valueAddedTaxIncluded': f['vatIncluded']}, 'VAT price specification')
        expected = {key.split(':')[1]: value for key, value in f['visible'].items() if key.startswith(filename + ':')}
        equal(page.facts, expected, filename + ' visible offer fields')
        for stale in ['Managed AI agents and workflow automation', 'Implementatie, configuratie en beheer van AI-agents', 'ZZPagent levert beheerde AI-agent']:
            equal(stale in source, False, 'retired metadata')
    llms = (root / 'llms.txt').read_text()
    equal([line for line in llms.splitlines() if line.startswith('Doelgroep:')], ['Doelgroep: ' + f['audience']], 'llms audience')
    equal([line for line in llms.splitlines() if line.startswith('- Vaste prijs:')], [f['llmsCostLine']], 'llms offer/terms')
    # Ensure the contract itself does not silently disagree on numeric price/one-off/VAT.
    price_nl = '€' + f"{f['price']:,}".replace(',', '.')
    for value in [*[v for k, v in f['visible'].items() if not k.endswith(':external')], f['llmsCostLine']]:
        equal(price_nl in value, True, 'canonical visible amount')
        equal('eenmalig' in value, True, 'canonical one-off')
        equal(bool(re.search(r'excl(?:usief|\.) btw', value)), True, 'canonical VAT exclusion')
    equal(f['vatIncluded'], False, 'VAT excluded')
    equal(f['currency'], 'EUR', 'currency')
    robots = (root / 'robots.txt').read_text()
    equal(bool(re.search(r'User-agent:\s*GPTBot\s+Disallow:\s*/', robots, re.I)), True, 'GPTBot stays blocked')
    return checks


def validate_visibility(root):
    facts = json.loads((root / 'data/offer-facts.json').read_text())
    expected = {"price": 19, "currency": "EUR", "vatIncluded": False, "optional": True,
                "frequency": "one measurement per month", "websites": 1,
                "questionAndPlatformSet": "fixed and agreed in advance",
                "measurementCostsIncluded": True, "cancellation": "monthly",
                "summary": True, "previousRoundComparison": True,
                "keyAttentionPoints": True, "websiteChangesIncluded": False,
                "additionalResearchIncluded": False, "selfManagementExternalCosts": "customer"}
    if facts.get('aiVisibilityMeasurement') != expected:
        raise ValueError('AI visibility measurement contract differs from approved scope')
    checks = 1
    for filename in ['index.html', 'kosten-hermes-assistent/index.html', 'ai-zichtbaarheidscheck/index.html', 'llms.txt']:
        source = (root / filename).read_text()
        if '€500' in source or '€19' not in source:
            raise ValueError(filename + ': retired or missing visibility price')
        checks += 1
    for filename in ['index.html', 'kosten-hermes-assistent/index.html']:
        source = (root / filename).read_text()
        for phrase in ['één meting', 'één website', 'vooraf afgesproken set vragen en AI-platformen', 'inclusief meetkosten',
                       'vergelijking met de vorige ronde', 'Maandelijks opzegbaar', 'Bij zelfbeheer', 'Websiteaanpassingen en extra onderzoek']:
            if phrase not in source:
                raise ValueError(filename + ': missing visibility term: ' + phrase)
            checks += 1
    return checks

if __name__ == '__main__':
    try:
        root = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT
        print(f'PASS: {validate(root) + validate_visibility(root)} offer consistency checks')
    except (ValueError, KeyError, OSError) as error:
        print('FAIL:', error, file=sys.stderr)
        sys.exit(1)
