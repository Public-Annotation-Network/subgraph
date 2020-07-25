import { log, json, ipfs, JSONValue, JSONValueKind, ByteArray, Bytes } from '@graphprotocol/graph-ts'
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

  // get AnnotatioBatch object from ipfs and try to parse it as a JSON array
  let batchIPFSData = ipfs.cat(batchCID);
  if (batchIPFSData == null) {
    log.debug("No data found for CID ({})", [batchCID]);
    return;
  }
  let batchJSONResult = json.try_fromBytes(batchIPFSData as Bytes);
  if (batchJSONResult.isError) {
    log.debug("Data found for CID ({}) can not be parsed as JSON", [batchCID]);
    return;
  }
  let batchJSON = batchJSONResult.value;
  if (batchJSON.kind != JSONValueKind.ARRAY) {
    log.debug("Data found for CID ({}) is not an array", [batchCID]);
    return;
  }
  let batchContent = batchJSON.toArray();
  
  for (let i = 0; i < batchContent.length; i++) {
    let annotationCID = batchContent[i].toString();
    log.debug("Processing annotation for CID ({})", [annotationCID]);

    let annotationIPFSData = ipfs.cat(annotationCID);
    if (annotationIPFSData == null) {
      log.debug("No data found for CID ({})", [annotationCID]);
      return;
    }
    let annotationJSONResult = json.try_fromBytes(annotationIPFSData as Bytes);
    if (annotationJSONResult.isError) {
      log.debug("Data found for CID ({}) can not be parsed as JSON", [annotationCID]);
      return;
    }
    let annotationJSON = annotationJSONResult.value;
    if (annotationJSON.kind != JSONValueKind.OBJECT) {
      log.debug("Data found for CID ({}) is not an object", [annotationCID]);
    }
    let annotationObject = annotationJSON.toObject();

    // get property credentialSubject from ipfs annotation object
    let credentialSubjectJSON = annotationObject.get("credentialSubject");
    if (credentialSubjectJSON == null) {
      log.debug("No property 'credentialSubject' found on object for CID ({})", [annotationCID]);
    }
    if (credentialSubjectJSON.kind != JSONValueKind.OBJECT) {
      log.debug("Data found for CID ({}) on property 'credentialSubject' is not an object", [annotationCID]);
    }
    // get property content from credentialSubject
    let contentJSON = credentialSubjectJSON.toObject().get("content");
    if (contentJSON == null) {
      log.debug("No property 'content' found on object 'credentialSubject' for CID ({})", [annotationCID]);
    }
    if (contentJSON.kind != JSONValueKind.STRING) {
      log.debug("Data found for CID ({}) on property 'content' is not a string", [annotationCID]);
    }
    let contentString = contentJSON.toString();

    let annotation = new Annotation(annotationCID);
    annotation.cid = annotationCID;
    annotation.batchCID = batchCID;
    annotation.ref = contentString;
    annotation.save();
  }

  batch.save();
}
