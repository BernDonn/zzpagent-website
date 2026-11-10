# Offer consistency (offline, no dependencies)

Run `python3 scripts/validate_offer.py` before release.

`data/offer-facts.json` is the canonical offer contract, not a runtime dependency.
Update the facts first when the approved offer changes, then update the static Service/Offer
JSON-LD on both pages, the marked visible fields, and the cost/audience lines in llms.txt.
Run the validator until they agree. Existing EN text-node dictionaries remain authoritative
for translations; check NL → EN → NL in the browser after editing a marked text.

Checks cover the Service/Offer name, scope, audience, conditions, price, currency and VAT,
the explicitly marked price/scope/external-cost/table fields and llms audience/cost line.
They do not claim to semantically validate every sentence, historical article or video.
The schema uses Service (not ProfessionalService), with termsOfService on Service and
valueAddedTaxIncluded on PriceSpecification. One-off nature is stated in name/description;
there is no invented rating, company social profile or SLA. The separate planned monthly
AI visibility Offer uses the approved 49.95 EUR excluding VAT, monthly billing and
PreOrder availability, never InStock. Its exact NL/EN availability qualifier, mandatory
one-off Hermes setup and customer-operated self-service scope must remain consistent
across all three pages, FAQ sources, llms.txt and canonical facts. These copy checks
do not establish operational readiness; confirm availability and the start date before
a customer starts. Website videos and YouTube are a separate release.

Vocabulary references: https://schema.org/Service, https://schema.org/Offer,
https://schema.org/PriceSpecification, https://schema.org/Audience.
Schema validity is not a rich-result or AI-recommendation guarantee.
