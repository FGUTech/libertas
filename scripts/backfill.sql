-- Libertas Backfill Script
-- Generated: 2026-02-04T01:34:31.037Z
-- Source: insights-feed.json

BEGIN;

-- Source Item: https://tails.net/news/version_7.4/
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  'afbf66db-4975-f3b7-a344-3f7b10257147'::uuid,
  'https://tails.net/news/version_7.4/',
  'rss',
  '2026-01-22T11:03:28.464Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  'c90d869005022648108d430c386f2798599c3db888a021ef3b89beb42bfad587',
  '2026-01-22T11:03:28.464Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: Tails 7.4 Adds Persistent Language Settings, Updates Core Privacy Tools
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  '4baca279-8983-4f01-8e09-c59500502286'::uuid,
  ARRAY['afbf66db-4975-f3b7-a344-3f7b10257147'::uuid],
  'Tails 7.4 Adds Persistent Language Settings, Updates Core Privacy Tools',
  'Tails 7.4 introduces persistent language/keyboard settings for easier access while updating Tor Browser to 15.0.4 and dropping BitTorrent downloads due to security concerns.',
  ARRAY['New persistent language and keyboard layout feature saves settings unencrypted on USB for easier passphrase entry', '• Tor Browser updated to version 15.0.4 with latest security improvements', '• Thunderbird email client updated to 140.6.0 for secure communications', '• Linux kernel upgraded to 6.12.63 for improved hardware support and security', '• BitTorrent download support dropped due to security concerns with v1 format transition', '• Fixed GPG file handling in Kleopatra and VeraCrypt desktop crashes', '• Automatic upgrades available from Tails 7.0+ to maintain persistent storage'],
  ARRAY['privacy', 'censorship-resistance', 'surveillance', 'comms'],
  85,
  95,
  ARRAY['https://tails.net/news/version_7.4/'],
  'published',
  'https://libertas.fgu.tech/posts/tails-7-4-adds-persistent-language-settings-updates-core-pri',
  '2026-01-22T11:03:28.464Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://freedomhouse.org/article/joint-letter-uk-prime-minister-ahead-visit-china
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  '32a7d7bd-c14f-56d6-05ba-8e20b4aa92fe'::uuid,
  'https://freedomhouse.org/article/joint-letter-uk-prime-minister-ahead-visit-china',
  'rss',
  '2026-01-22T11:02:40.249Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  'd4afdfb3af299dfb351d35f122f1ac417ecdec548cf332273d45be656efab3aa',
  '2026-01-22T11:02:40.249Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: 22 Rights Groups Urge UK PM to Confront China on Transnational Digital Repression
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  '8427a853-ffee-4c37-aae6-dce607b914f3'::uuid,
  ARRAY['32a7d7bd-c14f-56d6-05ba-8e20b4aa92fe'::uuid],
  '22 Rights Groups Urge UK PM to Confront China on Transnational Digital Repression',
  'Freedom House and 21 other rights organizations called on UK PM to address China''s transnational repression tactics including surveillance, harassment by proxy, and digital intimidation of UK-based activists and diaspora communities.',
  ARRAY['22 human rights organizations led by Freedom House and Amnesty International UK sent joint letter to UK Prime Minister', '• Letter urges confrontation of China''s transnational repression targeting activists and students in the UK', '• China using ''hybrid tactics'' including arrest warrants, bounties, surveillance, and ''harassment by proxy'' targeting families', '• Organizations document systematic digital intimidation to silence overseas dissent and diaspora communities', '• Letter highlights cases of imprisoned activists including British National Jimmy Lai, sentenced for journalism', '• Groups call for human rights impact assessments on all UK-China trade and investment deals', '• Timing coincides with planned UK state visit to China, creating diplomatic pressure point'],
  ARRAY['surveillance', 'censorship-resistance', 'activism', 'privacy'],
  78,
  95,
  ARRAY['https://freedomhouse.org/article/joint-letter-uk-prime-minister-ahead-visit-china'],
  'published',
  'https://libertas.fgu.tech/posts/22-rights-groups-urge-uk-pm-to-confront-china-on-transnation',
  '2026-01-22T11:02:40.249Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://cpj.org/2026/01/freefrenchiemaecumpio-ngos-condemn-journalists-conviction-as-blow-to-press-freedom-in-the-philippines/
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  'e997c404-3eaf-9cda-8bcb-18dd54b3d71f'::uuid,
  'https://cpj.org/2026/01/freefrenchiemaecumpio-ngos-condemn-journalists-conviction-as-blow-to-press-freedom-in-the-philippines/',
  'rss',
  '2026-01-22T11:02:23.415Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  'fa546a513c691a613713129e7c14f722d89bc02c0c1ad8a1a084d251d4a803c6',
  '2026-01-22T11:02:23.415Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: Filipino Journalist Sentenced 12-18 Years on Terrorism Charges Amid Evidence Planting Claims
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  'ccef45ac-850d-407d-9bf0-8de2fff3c37e'::uuid,
  ARRAY['e997c404-3eaf-9cda-8bcb-18dd54b3d71f'::uuid],
  'Filipino Journalist Sentenced 12-18 Years on Terrorism Charges Amid Evidence Planting Claims',
  'Frenchie Mae Cumpio, 26-year-old Filipino journalist reporting on police/military abuses, sentenced to 12-18 years for terrorism financing after 5 years detention, with allegations authorities planted weapons during arrest.',
  ARRAY['Filipino journalist Frenchie Mae Cumpio sentenced to 12-18 years in prison for terrorism financing charges', '• Cumpio has been detained since February 2020, arrested alongside four human rights defenders', '• Serious allegations that authorities planted weapons during raid to justify her arrest', '• Previously executive director of Eastern Vista news website, reported on police/military abuses in Eastern Visayas', '• International coalition of press freedom orgs (CPJ, RSF, NUJP) condemns verdict as ''grave miscarriage of justice''', '• UN Special Rapporteur on freedom of expression called for justice, visited her in prison in 2024', '• Case included in 2025 ''Most Urgent'' list by One Free Press Coalition', '• Multiple embassy representatives attended trial, showing international concern over press freedom erosion'],
  ARRAY['censorship-resistance', 'activism', 'surveillance'],
  78,
  95,
  ARRAY['https://cpj.org/2026/01/freefrenchiemaecumpio-ngos-condemn-journalists-conviction-as-blow-to-press-freedom-in-the-philippines/'],
  'published',
  'https://libertas.fgu.tech/posts/filipino-journalist-sentenced-12-18-years-on-terrorism-charg',
  '2026-01-22T11:02:23.415Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://netblocks.org/reports/internet-cut-in-gabon-on-election-day-Q8oxM3An
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  '692064cc-6114-9b9b-ee40-7471d19c3013'::uuid,
  'https://netblocks.org/reports/internet-cut-in-gabon-on-election-day-Q8oxM3An',
  'rss',
  '2026-01-22T11:01:51.588Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  '7d43028202c93119d1edb96e1573011097d290aabe84f0f9a94994dc5c1c4e33',
  '2026-01-22T11:01:51.588Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: Gabon Implements Nationwide Internet Blackout During 2023 Presidential Elections
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  '4f988c95-772f-4329-9012-5a87334207fc'::uuid,
  ARRAY['692064cc-6114-9b9b-ee40-7471d19c3013'::uuid],
  'Gabon Implements Nationwide Internet Blackout During 2023 Presidential Elections',
  'Gabon cut internet access nationwide during August 2023 elections, with service restored after military coup. Government cited preventing violence and misinformation as justification.',
  ARRAY['NetBlocks confirmed nation-scale internet blackout across Gabon on August 26, 2023 election day', '• Government justified shutdown as preventing ''calls for violence'' and ''false information'' spread', '• Blackout lasted from election day through August 30, when military officers seized power', '• Internet connectivity restored after President Ali Bongo was placed under house arrest', '• Communications Minister imposed territory-wide curfew alongside internet restrictions', '• Pattern continues trend of election-period internet shutdowns across 12+ African nations', '• Shutdown targeted multiple ISPs simultaneously, indicating coordinated government action'],
  ARRAY['censorship-resistance', 'surveillance', 'activism'],
  85,
  95,
  ARRAY['https://netblocks.org/reports/internet-cut-in-gabon-on-election-day-Q8oxM3An'],
  'published',
  'https://libertas.fgu.tech/posts/gabon-implements-nationwide-internet-blackout-during-2023-pr',
  '2026-01-22T11:01:51.588Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://ooni.org/post/2025-iran-censorship-womens-rights/
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  'f678348c-343b-1995-5884-76eb7ea266a0'::uuid,
  'https://ooni.org/post/2025-iran-censorship-womens-rights/',
  'rss',
  '2026-01-22T11:01:15.491Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  '2d8185eae3d11cc84abfca236470317cc8053e493aea383b9aaace7ecedf2711',
  '2026-01-22T11:01:15.491Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: OONI Documents Decade-Long Censorship of Women's Rights Sites in Iran
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  'd52c10c9-0dee-4a92-85d5-02abcad0e525'::uuid,
  ARRAY['f678348c-343b-1995-5884-76eb7ea266a0'::uuid],
  'OONI Documents Decade-Long Censorship of Women''s Rights Sites in Iran',
  'OONI measurements show Iran has systematically blocked women''s rights websites since at least 2014, with repression intensifying despite 2022 Women, Life, Freedom protests.',
  ARRAY['OONI data confirms women''s rights websites blocked in Iran since at least 2014', '• Censorship persists despite massive 2022 Women, Life, Freedom protests following Mahsa Jina Amini''s death', '• UN reports intensified repression of women despite mass demonstrations', '• Iran maintains severe restrictions on both women''s rights and information access', '• Pattern shows systematic targeting of human rights content, not just political sites', '• Long-term censorship data provides baseline for measuring circumvention needs', '• Demonstrates sustained government commitment to information control around gender issues'],
  ARRAY['censorship-resistance', 'surveillance', 'activism', 'privacy'],
  85,
  95,
  ARRAY['https://ooni.org/post/2025-iran-censorship-womens-rights/'],
  'published',
  'https://libertas.fgu.tech/posts/ooni-documents-decade-long-censorship-of-women-s-rights-site',
  '2026-01-22T11:01:15.491Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://arstechnica.com/tech-policy/2026/01/judge-orders-stop-to-fbi-search-of-devices-seized-from-washington-post-reporter/
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  '6b0cd461-c0cf-73a8-3513-8eb76eee34cc'::uuid,
  'https://arstechnica.com/tech-policy/2026/01/judge-orders-stop-to-fbi-search-of-devices-seized-from-washington-post-reporter/',
  'rss',
  '2026-01-22T11:00:47.914Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  'ba544b1d2e591d4b8705e775183601b49754036f32db8b8c2da8ed0f03901b4d',
  '2026-01-22T11:00:47.914Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: Federal Judge Halts FBI Search of Washington Post Reporter's Seized Devices
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  'e30e6b3a-b2f8-4765-ba4d-9d18d7f46aae'::uuid,
  ARRAY['6b0cd461-c0cf-73a8-3513-8eb76eee34cc'::uuid],
  'Federal Judge Halts FBI Search of Washington Post Reporter''s Seized Devices',
  'Judge orders temporary stop to FBI search of devices seized from WaPo reporter Hannah Natanson''s home in Pentagon leak investigation, citing First Amendment concerns.',
  ARRAY['Federal judge ordered halt to FBI search of devices seized from Washington Post reporter Hannah Natanson', '• FBI executed search warrant at reporter''s home last week as part of Pentagon contractor leak investigation', '• Natanson is not subject of investigation but devices seized in connection to alleged source leaks', '• Washington Post filed motions to return property and prevent device review pending court ruling', '• Post argues ''almost none of seized data'' responsive to warrant seeking records from single contractor', '• Legal challenge cites First Amendment protections and attorney-client privilege concerns', '• Case highlights ongoing tension between national security investigations and press freedom', '• Temporary reprieve pending further court proceedings on whether search can resume'],
  ARRAY['surveillance', 'censorship-resistance', 'privacy'],
  78,
  90,
  ARRAY['https://arstechnica.com/tech-policy/2026/01/judge-orders-stop-to-fbi-search-of-devices-seized-from-washington-post-reporter/'],
  'published',
  'https://libertas.fgu.tech/posts/federal-judge-halts-fbi-search-of-washington-post-reporter-s',
  '2026-01-22T11:00:47.914Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://www.accessnow.org/press-release/keepiton-iran-digital-darkness-human-rights-abuses/
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  '2e4bf0e6-35da-8d22-39ae-a056531e2b8d'::uuid,
  'https://www.accessnow.org/press-release/keepiton-iran-digital-darkness-human-rights-abuses/',
  'rss',
  '2026-01-21T06:47:26.800Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  '500a4c80be47336ff69f02bce4c168ce57c35db76fdb8f93ae6de8bb5084e2ef',
  '2026-01-21T06:47:26.800Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: Iran's Complete Internet Blackout Conceals Mass Violence Against 2,403+ Killed Protesters
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  '1d252679-b4f4-4448-ac9f-bfdd44147310'::uuid,
  ARRAY['2e4bf0e6-35da-8d22-39ae-a056531e2b8d'::uuid],
  'Iran''s Complete Internet Blackout Conceals Mass Violence Against 2,403+ Killed Protesters',
  'Iran imposed total internet shutdown Jan 8, 2026 during nationwide protests, killing 2,403+ protesters and arresting 18,000+ while blocking all communications including satellite internet to conceal human rights abuses.',
  ARRAY['Complete nationwide internet blackout began Jan 8, 2026 at 18:45 UTC confirmed by Cloudflare data showing near-zero traffic', '• Preceded by 35% throttling and circumvention tool blocking starting Dec 29, 2025 following currency collapse protests', '• At least 2,403 protesters killed and over 18,000 arrested as of Jan 13, 2026 according to Human Rights Activists News Agency', '• Satellite internet services also disrupted through signal jamming and equipment confiscation, eliminating backup connectivity', '• Access Now and #KeepItOn coalition document pattern where internet shutdowns consistently precede mass violence in Iran', '• Tech activists and internet freedom community achieved limited connectivity restoration during shutdown', '• International judicial bodies now recognize internet shutdowns as concealment mechanism for investigating international crimes', '• Coalition of 40+ organizations demands immediate restoration of connectivity and independent investigation'],
  ARRAY['censorship-resistance', 'comms', 'surveillance', 'activism', 'privacy'],
  95,
  88,
  ARRAY['https://www.accessnow.org/press-release/keepiton-iran-digital-darkness-human-rights-abuses/'],
  'published',
  'https://libertas.fgu.tech/posts/iran-s-complete-internet-blackout-conceals-mass-violence-aga',
  '2026-01-21T06:47:26.800Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://cointelegraph.com/news/bhutan-sei-blockchain-validator-digital-transformation
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  'c9dfa4d4-f0f3-6350-b813-a4a03f0dc481'::uuid,
  'https://cointelegraph.com/news/bhutan-sei-blockchain-validator-digital-transformation',
  'rss',
  '2026-01-21T06:46:52.121Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  '1fb9c5f2f432d2166b3ba625dc4e09135dc263dd589d6e94b460e97dc89f6121',
  '2026-01-21T06:46:52.121Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Source Item: https://cointelegraph.com/news/bhutan-sei-blockchain-validator-digital-transformation?utm_source=rss_feed&utm_medium=rss&utm_campaign=rss_partner_inbound
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  '5b9b386e-2651-61c2-ba99-6d60049b0130'::uuid,
  'https://cointelegraph.com/news/bhutan-sei-blockchain-validator-digital-transformation?utm_source=rss_feed&utm_medium=rss&utm_campaign=rss_partner_inbound',
  'rss',
  '2026-01-21T06:46:52.121Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  'dbd92b4ede03e6957f928ab26ee4de724d249d9caa87ddea2a2b1118ff7fcda1',
  '2026-01-21T06:46:52.121Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: Bhutan Expands State Blockchain Portfolio with Sei Validator Node
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  '3258e802-12a0-447d-a9a8-16a39a48cf67'::uuid,
  ARRAY['c9dfa4d4-f0f3-6350-b813-a4a03f0dc481'::uuid, '5b9b386e-2651-61c2-ba99-6d60049b0130'::uuid],
  'Bhutan Expands State Blockchain Portfolio with Sei Validator Node',
  'Bhutan becomes validator on Sei blockchain, adding to existing Bitcoin mining operations and Ethereum-powered self-sovereign ID system in comprehensive state-level blockchain adoption.',
  ARRAY['Bhutan officially becomes validator node on Sei blockchain network', '• Adds to existing portfolio including active Bitcoin mining operations', '• Previously launched self-sovereign identity system built on Ethereum', '• Represents rare case of comprehensive state-level blockchain adoption', '• Covers three key freedom tech areas: mining, identity sovereignty, and validation', '• Small nation demonstrating practical blockchain integration across government services', '• Pattern suggests strategic national blockchain diversification approach'],
  ARRAY['bitcoin', 'identity', 'sovereignty'],
  72,
  78,
  ARRAY['https://cointelegraph.com/news/bhutan-sei-blockchain-validator-digital-transformation', 'https://cointelegraph.com/news/bhutan-sei-blockchain-validator-digital-transformation?utm_source=rss_feed&utm_medium=rss&utm_campaign=rss_partner_inbound'],
  'published',
  'https://libertas.fgu.tech/posts/bhutan-expands-state-blockchain-portfolio-with-sei-validator',
  '2026-01-21T06:46:52.121Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://www.eff.org/deeplinks/2026/01/statutory-damages-fuel-copyright-based-censorship
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  'a9f67c93-406b-eec1-5a94-7f8afd85bfff'::uuid,
  'https://www.eff.org/deeplinks/2026/01/statutory-damages-fuel-copyright-based-censorship',
  'rss',
  '2026-01-21T06:46:12.891Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  '4efc9457a8f285ec36d0faf92f8cfde3e8f4dcaf57164f715cc4cf099f66efe1',
  '2026-01-21T06:46:12.891Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: EFF: Broken Copyright Damages Fuel Platform Censorship
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  'b0f7e524-bd71-492e-be01-7bcd56e34a5b'::uuid,
  ARRAY['a9f67c93-406b-eec1-5a94-7f8afd85bfff'::uuid],
  'EFF: Broken Copyright Damages Fuel Platform Censorship',
  'EFF highlights how U.S. copyright''s statutory damages ($200-$150k per work) create financial incentives for platforms to over-censor, stifling online expression and fair use.',
  ARRAY['U.S. copyright allows statutory damages of $200-$150,000 per work without proving actual harm', '• Unpredictable damages create financial Russian roulette for platforms and users', '• Platforms respond by implementing aggressive automated takedown systems like YouTube''s Content ID', '• Massive damages awards (e.g. $222,000 for 24 music tracks) discourage fair use experimentation', '• System biases enforcement decisions toward major rightsholders over users', '• Users self-censor to avoid potentially ruinous penalties for creative re-use', '• Reform proposals include capping damages to multiples of actual harm or excluding good-faith fair use cases'],
  ARRAY['censorship-resistance', 'privacy'],
  78,
  95,
  ARRAY['https://www.eff.org/deeplinks/2026/01/statutory-damages-fuel-copyright-based-censorship'],
  'published',
  'https://libertas.fgu.tech/posts/eff-broken-copyright-damages-fuel-platform-censorship',
  '2026-01-21T06:46:12.891Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Source Item: https://www.eff.org/deeplinks/2026/01/so-youve-hit-age-gate-what-now
INSERT INTO source_items (id, url, platform, fetched_at, extracted_text, content_hash, published_at, created_at, updated_at)
VALUES (
  '1dd677ac-748e-bc23-95c9-3c3d848b2a7f'::uuid,
  'https://www.eff.org/deeplinks/2026/01/so-youve-hit-age-gate-what-now',
  'rss',
  '2026-01-14T22:58:54.644Z'::timestamptz,
  '[Content recovered from citation - original text not available]',
  '0f361a58c625c4bdba54cf8c1fde98ef574c31e8ab5bb45af87d53fd72beb435',
  '2026-01-14T22:58:54.644Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (content_hash) DO NOTHING;

-- Insight: EFF Guide to Navigating Age Verification Gates While Protecting Privacy
INSERT INTO insights (id, source_item_ids, title, tldr, summary_bullets, topics, freedom_relevance_score, credibility_score, citations, status, published_url, published_at, created_at, updated_at)
VALUES (
  '71005a65-6894-458f-a99e-5f893f156bb7'::uuid,
  ARRAY['1dd677ac-748e-bc23-95c9-3c3d848b2a7f'::uuid],
  'EFF Guide to Navigating Age Verification Gates While Protecting Privacy',
  'EFF releases practical guide for users forced to comply with age verification mandates, offering privacy-preserving strategies when faced with age gates on major platforms.',
  ARRAY['EFF provides harm reduction guidance for mandatory age verification despite opposing all age verification mandates', '• Recommends submitting absolute minimum data possible to reduce breach exposure', '• Facial age estimation works poorly for people of color, trans/nonbinary people, and people with disabilities', '• Meta uses Yoti for face scans, which uploads photos to third-party servers with tracker concerns', '• Document verification creates identity exposure beyond age - Discord breach leaked 70,000 ID photos', '• Some services like Incode (used by TikTok) retain ID images indefinitely by default', '• Credit card and email database verification offer less sensitive alternatives but still undermine anonymity', '• Guide covers evaluation framework: data required, access, retention, audits, and visibility'],
  ARRAY['privacy', 'surveillance', 'identity', 'censorship-resistance'],
  78,
  95,
  ARRAY['https://www.eff.org/deeplinks/2026/01/so-youve-hit-age-gate-what-now'],
  'published',
  'https://libertas.fgu.tech/posts/eff-guide-to-navigating-age-verification-gates-while-protect',
  '2026-01-14T22:58:54.644Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- DIGESTS
-- ===========================================

-- Digest: Weekly Digest: 2026-01-15 to 2026-01-21
INSERT INTO digests (id, period_start, period_end, insight_count, tldr, content_markdown, top_topics, published_url, published_at, created_at, updated_at)
VALUES (
  '6048573e-c799-45c9-95da-e313292e6ebf'::uuid,
  '2026-01-15'::date,
  '2026-01-21'::date,
  3,
  'Iran''s complete internet blackout during deadly protests demonstrates the urgent need for censorship-resistant communication tools, while copyright law''s structural incentives continue driving platform over-censorship. Meanwhile, nation-state blockchain adoption expands with Bhutan''s validator operations.',
  'Iran''s complete internet blackout during deadly protests demonstrates the urgent need for censorship-resistant communication tools, while copyright law''s structural incentives continue driving platform over-censorship. Meanwhile, nation-state blockchain adoption expands with Bhutan''s validator operations.',
  ARRAY['weekly-digest'],
  'https://libertas.fgu.tech/digests/weekly-2026-01-21',
  '2026-01-22T00:45:55.297Z'::timestamptz,
  NOW(),
  NOW()
)
ON CONFLICT (period_start, period_end) DO NOTHING;

COMMIT;

-- Summary:
-- Source Items: 11
-- Insights: 10
