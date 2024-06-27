import { roc } from "@polkadot-api/descriptors"
import { createClient } from "polkadot-api"
import { WebSocketProvider } from "polkadot-api/ws-provider/node";
 
const client = createClient(
  WebSocketProvider("wss://rococo-rpc.polkadot.io")
);

const rocApi = client.getTypedApi(roc)

const main = async () => {
    //get the latest finalized block from the relay chain
    const lastFinalizedBlock = await rocApi.query.System.Number.getValue()

    //how many blocks we want to allow? 900_000 blocks is around 2 months.
    const MAX_BLOCKS = 900000

    // get the last committed block by a parachain from the relay chain.
    const getLastWatermark = await rocApi.query.Hrmp.HrmpWatermarks.getEntries()

    //Check chains that have committed a block more than MAX_BLOCKS ago

    const chainsToDowngrade = []
    
    getLastWatermark.map(para => {
        //para.keyArgs[0] is paraID
        //para.value is blockHeight 
        const minBlock = lastFinalizedBlock - MAX_BLOCKS
        if (para.value < minBlock) {
            chainsToDowngrade.push({
                paraID: para.keyArgs[0],
                lastCommitedBlock: para.value
            })
        }
    })

    const amount = chainsToDowngrade.length

    console.log(amount)
    console.log(chainsToDowngrade)
}

main().catch(console.error).finally(() => process.exit());
