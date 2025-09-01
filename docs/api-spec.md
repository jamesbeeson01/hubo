<facThinking>
Target file: docs/api-spec.md

The file we previously created already contains the requested five sections and TypeScript-style blocks, but I’ll review to ensure each bullet from the user is explicitly covered and headings match.

Checklist:
1. Auth & Context – present with interface HuboContext and notes ✔️  
2. Provider Interfaces – SearchProvider, Ranker, AppModule with correct signatures, CancelToken ✔️  
3. Registry Contract – AppPlacement, AppDefinition, exported appsRegistry array + rules ✔️  
4. Error Model – HuboError interface and handling guidelines ✔️  
5. Optional Future HTTP API – table of endpoints + envelope + /search example ✔️  

Minor tune-ups:
• Confirm “supportsPrefixes” property on SearchProvider as user requested.  
• Ensure section numbers exactly follow instructions (1-5).  
• Keep implementation-agnostic phrasing.  

No other edits needed.