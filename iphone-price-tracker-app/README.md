# iPhone Price Tracker (Refurbed)

Questo è il codice sorgente per il progetto Next.js che include la logica di estrazione dati e l'interfaccia Dashboard.

## Problema con l'ambiente Node.js locale
Durante il setup è stato rilevato che l'eseguibile `npm` all'interno della cartella `node_portable` dell'utente è corrotto o manca del modulo `npm-prefix.js`. 
Per questo motivo, non è stato possibile eseguire `npx create-next-app` in modo automatizzato. I file React/TypeScript principali sono stati comunque generati manualmente in questa cartella.

## Come completare il setup in locale (quando npm sarà funzionante)
1. Correggi l'installazione di Node.js/npm.
2. In una cartella vuota, esegui: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"`
3. Installa cheerio: `npm install cheerio`
4. Copia i file presenti in questa cartella (`app/page.tsx`, `app/api/scrape/route.ts`, `components/`) andandoli a sovrascrivere/aggiungere a quelli del progetto appena inizializzato.
5. Avvia il server: `npm run dev`

## Istruzioni di Deploy su Vercel

Dato che l'estrazione usa **Cheerio** nativamente in TypeScript, il deploy su Vercel è immediato e non richiede runtime misti (Python/Node).

1. **GitHub Integration (Consigliata)**
   - Inizializza un repository Git locale e fai il commit di tutti i file generati al punto precedente.
   - Carica il repository su GitHub.
   - Vai su [Vercel](https://vercel.com/) e accedi.
   - Clicca su "Add New..." -> "Project".
   - Importa il tuo repository GitHub.
   - Vercel riconoscerà automaticamente il framework come "Next.js".
   - Non ci sono variabili d'ambiente speciali richieste. Clicca su "Deploy".

2. **Vercel CLI**
   - Assicurati di aver installato la CLI: `npm i -g vercel`.
   - Dal terminale, posizionati nella root del progetto.
   - Esegui il comando `vercel`.
   - Segui i prompt a schermo per collegare il progetto al tuo account e avviarne il deploy.
