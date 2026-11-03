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
there is no invented billing interval, availability, rating, company social profile or SLA.

Vocabulary references: https://schema.org/Service, https://schema.org/Offer,
https://schema.org/PriceSpecification, https://schema.org/Audience.
Schema validity is not a rich-result or AI-recommendation guarantee.
