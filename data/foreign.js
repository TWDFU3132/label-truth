// Rules for flagged ingredients in other countries. Researched 2026-09-18.
// level: "banned" = not allowed in food there · "restricted" = allowed only in a few foods or with a source rule
//        "warning" = allowed, but the package must carry a warning · "limit" = capped at a low level
// Keys match the glossary entry names (n) in glossary.js.
window.FOREIGN = {
 "Titanium dioxide": {
   rules: [
     {where:"European Union (27 countries)", level:"banned", since:"2022", note:"EFSA could no longer rule out DNA damage, so the EU removed it from the approved list."},
     {where:"Northern Ireland", level:"banned", since:"2022", note:"Follows EU food rules."},
     {where:"France", level:"banned", since:"2020", note:"Banned it on its own two years before the rest of the EU."}
   ],
   allowed:"U.S. (up to 1% of the food), Great Britain (England, Scotland, Wales) and Canada. Their regulators reviewed it and found no safety concern.",
   src:[["USDA FAS: EU titanium dioxide ban","https://fas.usda.gov/data/european-union-titanium-dioxide-banned-food-additive-eu"],["UK divergence (CMS Law)","https://cms.law/en/gbr/legal-updates/Titanium-Dioxide-E171-A-practical-example-of-UK-divergence-from-EU-law"]]
 },
 "Potassium bromate": {
   rules: [
     {where:"European Union & United Kingdom", level:"banned", note:"Not on the approved additive list. The WHO's cancer agency rates it 'possibly carcinogenic' (it caused tumors in rats)."},
     {where:"Canada", level:"banned"},
     {where:"China", level:"banned", since:"2005"},
     {where:"India", level:"banned", since:"2016"},
     {where:"Brazil, Argentina, Peru", level:"banned"},
     {where:"Nigeria, Sri Lanka, South Korea", level:"banned", note:"Sri Lanka since 2001."},
     {where:"California (U.S. state)", level:"banned", since:"2027", note:"California Food Safety Act, signed 2023."}
   ],
   allowed:"Federally in the U.S. Japan allows it, though bakers there stopped using it voluntarily in 1980 and one large baker restarted in 2005.",
   src:[["Potassium bromate (Wikipedia, with citations)","https://en.wikipedia.org/wiki/Potassium_bromate"]]
 },
 "Azodicarbonamide (ADA)": {
   rules: [
     {where:"European Union & United Kingdom", level:"banned", note:"Not an approved food additive. The EU also lists it as a 'substance of very high concern' for workers who breathe it."},
     {where:"Australia & New Zealand", level:"banned"}
   ],
   allowed:"U.S., up to 45 parts per million in flour. Subway and Wendy's dropped it in 2014 after public pressure.",
   src:[["Azodicarbonamide (Wikipedia, with citations)","https://en.wikipedia.org/wiki/Azodicarbonamide"]]
 },
 "Brominated vegetable oil": {
   rules: [
     {where:"United Kingdom", level:"banned", since:"1970"},
     {where:"India", level:"banned", since:"1990"},
     {where:"European Union", level:"banned", since:"2008"},
     {where:"Japan", level:"banned", since:"2010"},
     {where:"Canada", level:"banned", since:"2024"}
   ],
   us:"The FDA revoked it in July 2024 (effective August 2, 2024). Drink makers got one year to use up old stock, so seeing it now means old or imported product.",
   src:[["CSPI: FDA bans BVO","https://www.cspi.org/cspi-news/bvo-fda-finally-bans-brominated-vegetable-oil"],["BVO (Wikipedia)","https://en.wikipedia.org/wiki/Brominated_vegetable_oil"]]
 },
 "Propylparaben": {
   rules: [
     {where:"European Union", level:"banned", since:"2006", note:"Removed from the list of approved preservatives by Directive 2006/52/EC over hormone-disruption concerns."},
     {where:"California (U.S. state)", level:"banned", since:"2027", note:"California Food Safety Act."}
   ],
   allowed:"Federally in the U.S.",
   src:[["Directive 2006/52/EC (FAOLEX)","https://faolex.fao.org/docs/pdf/eur65341.pdf"]]
 },
 "Bleached flour": {
   rules: [
     {where:"European Union", level:"banned", note:"Chlorine, bromates and peroxides (like benzoyl peroxide) aren't allowed for treating flour."}
   ],
   allowed:"U.S. and Canada.",
   src:[["Flour bleaching agent (Wikipedia)","https://en.wikipedia.org/wiki/Flour_bleaching_agent"]]
 },
 "Partially hydrogenated oil": {
   rules: [
     {where:"Canada", level:"banned", since:"2018"},
     {where:"European Union", level:"limit", since:"2021", note:"Industrial trans fat must stay under 2 g per 100 g of fat."},
     {where:"Denmark", level:"limit", since:"2003", note:"The first country to effectively ban artificial trans fat."},
     {where:"Switzerland", level:"limit", since:"2008"},
     {where:"Brazil", level:"limit", since:"2023"}
   ],
   us:"Banned in the U.S. too; FDA's phase-out finished in 2018–2020.",
   src:[["Trans fat regulation (Wikipedia)","https://en.wikipedia.org/wiki/Trans_fat_regulation"],["European Commission: trans fat","https://food.ec.europa.eu/food-safety/labelling-and-nutrition/trans-fat-food_en"]]
 },
 "Red 3": {
   rules: [
     {where:"European Union", level:"restricted", since:"1994", note:"Only allowed in cocktail and candied cherries. Not in candy, cake decorations or drinks."},
     {where:"United Kingdom", level:"restricted", note:"EU rules, plus allowed for coloring eggshells."},
     {where:"California (U.S. state)", level:"banned", since:"2027"}
   ],
   us:"The FDA revoked Red 3 for all foods in January 2025. Companies must remove it by January 15, 2027.",
   allowed:"Canada and Australia/New Zealand (with limits).",
   src:[["Erythrosine (Wikipedia)","https://en.wikipedia.org/wiki/Erythrosine"]]
 },
 "Green 3": {
   rules: [
     {where:"European Union", level:"banned", note:"Fast Green FCF is not an approved food color in the EU."}
   ],
   us:"Part of the FDA's announced phase-out of petroleum dyes by the end of 2026.",
   src:[["Fast Green FCF (Wikipedia)","https://en.wikipedia.org/wiki/Fast_Green_FCF"]]
 },
 "Citrus Red 2": {
   rules: [
     {where:"European Union", level:"banned", note:"Not an approved food color. In the U.S. it's only allowed on orange peels."}
   ],
   us:"The FDA began revoking it in 2025.",
   src:[["E numbers list (Wikipedia)","https://en.wikipedia.org/wiki/E_number"],["FDA dye phase-out","https://www.fda.gov/news-events/press-announcements/hhs-fda-phase-out-petroleum-based-synthetic-dyes-nations-food-supply"]]
 },
 "Red 40": {
   rules: [
     {where:"European Union & United Kingdom", level:"warning", since:"2010", note:"Allowed, but the package must say: 'may have an adverse effect on activity and attention in children.' Many European brands switched to beet or paprika color instead."}
   ],
   us:"Part of the FDA's announced phase-out of petroleum dyes by the end of 2026 (mostly through voluntary company pledges).",
   src:[["EU colour warning (CMS Law)","https://cms-lawnow.com/en/ealerts/2010/08/compulsory-warnings-on-colours-in-food-and-drink"],["FDA dye phase-out","https://www.fda.gov/news-events/press-announcements/hhs-fda-phase-out-petroleum-based-synthetic-dyes-nations-food-supply"]]
 },
 "Yellow 5": {
   rules: [
     {where:"European Union & United Kingdom", level:"warning", since:"2010", note:"Allowed, but the package must say: 'may have an adverse effect on activity and attention in children.'"}
   ],
   us:"Part of the FDA's announced phase-out of petroleum dyes by the end of 2026.",
   src:[["EU colour warning (CMS Law)","https://cms-lawnow.com/en/ealerts/2010/08/compulsory-warnings-on-colours-in-food-and-drink"],["FDA dye phase-out","https://www.fda.gov/news-events/press-announcements/hhs-fda-phase-out-petroleum-based-synthetic-dyes-nations-food-supply"]]
 },
 "Yellow 6": {
   rules: [
     {where:"European Union & United Kingdom", level:"warning", since:"2010", note:"Allowed, but the package must say: 'may have an adverse effect on activity and attention in children.'"}
   ],
   us:"Part of the FDA's announced phase-out of petroleum dyes by the end of 2026.",
   src:[["EU colour warning (CMS Law)","https://cms-lawnow.com/en/ealerts/2010/08/compulsory-warnings-on-colours-in-food-and-drink"],["FDA dye phase-out","https://www.fda.gov/news-events/press-announcements/hhs-fda-phase-out-petroleum-based-synthetic-dyes-nations-food-supply"]]
 },
 "L-cysteine": {
   rules: [
     {where:"European Union", level:"restricted", note:"Allowed, but human hair may NOT be used as the source. U.S. rules don't say anything about the source."}
   ],
   src:[["Cysteine (Wikipedia, citing EU spec)","https://en.wikipedia.org/wiki/Cysteine"]]
 }
};
