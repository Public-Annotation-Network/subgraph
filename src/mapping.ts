import { log, json, ipfs, JSONValueKind, ByteArray, Bytes } from '@graphprotocol/graph-ts'
import { StoreCIDCall } from '../generated/CIDRegistry/CIDRegistry'
import { AnnotationBatch, Annotation } from '../generated/schema'


export function handleStoreCID(call: StoreCIDCall): void {
  log.debug("Process call (StoreCID) for CID ({})", [call.inputs.cid]);
  
  let batchCID = call.inputs.cid;
  let batch = AnnotationBatch.load(batchCID);
  if (batch == null) {
    batch = new AnnotationBatch(batchCID);
    batch.cid = batchCID;
  }
  
  let data = ipfs.cat(batchCID);
  if (data == null) {
    log.debug("No data found for CID ({})", [batchCID]);
    return;
  }
  let dataJSON = json.try_fromBytes(data as Bytes);
  if (dataJSON.isError) {
    log.debug("Data found for CID ({}) can not be parsed as JSON", [batchCID]);
    return;
  }
  if (dataJSON.value.kind != JSONValueKind.ARRAY) {
    log.debug("Data found for CID ({}) is not an array", [batchCID]);
    return;
  }
  let batchContent = dataJSON.value.toArray();
  
  for (let i = 0; i < batchContent.length; i++) {
    let annotationCID = batchContent[i].toString();
    log.debug("Processing annotation for CID ({})", [annotationCID]);
    let annotation = new Annotation(annotationCID);
    annotation.cid = annotationCID;
    annotation.batchCID = batchCID;
    annotation.save();
  }

  batch.save();
}
