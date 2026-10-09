# cyb3r-site-js

Front-end section scripts for cyb3rmedia.com, split out of `cyb3r-services-section`.

That repo is ~145 MB and jsDelivr refuses to serve files from a package over 50 MB
("Package size exceeded the configured limit of 50 MB"), which breaks files one at a
time as CDN caches expire. Scripts live here so they stay reliably servable.

`cyb3r-sections.js` powers the homepage Selected Works horizontal-scroll section and the
Design in Motion helix. It is loaded by `home-loader.js`; because that loader is a
registered Webflow script pinned to a commit and the Custom Code API is OAuth-only, the
site head rewrites the chained URL to point here.
