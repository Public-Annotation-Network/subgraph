import { log, json, ipfs, JSONValue, JSONValueKind, ByteArray, Bytes, Result } from '@graphprotocol/graph-ts'
import { StoreCIDCall } from '../generated/CIDRegistry/CIDRegistry'
import { AnnotationBatch, Annotation } from '../generated/schema'


function getCredentialSubjectOfCID(cid: string): JSONValue | null {
  let ipfsData = ipfs.cat(cid);
  if (ipfsData == null) {
    log.debug("No data found for CID ({})", [cid]);
    return null;
  }
  let jsonResult = json.try_fromBytes(ipfsData as Bytes);
  if (jsonResult.isError) {
    log.debug("Data found for CID ({}) can not be parsed as JSON", [cid]);
    return null;
  }
  let value = jsonResult.value;
  if (value.kind != JSONValueKind.OBJECT) {
    log.debug("Data found for CID ({}) is not an object", [cid]);
    return null;
  }
  let object = value.toObject();

  // get property credentialSubject from ipfs annotation object
  let credentialSubjectJSON = object.get("credentialSubject");
  if (credentialSubjectJSON == null) {
    log.debug("No property 'credentialSubject' found on object for CID ({})", [cid]);
    return null;
  }
  if (credentialSubjectJSON.kind != JSONValueKind.OBJECT) {
    log.debug("Data found for CID ({}) on property 'credentialSubject' is not an object", [cid]);
    return null;
  }

  return  credentialSubjectJSON;
}

export function handleStoreCID(call: StoreCIDCall): void {
  log.debug("Process call (StoreCID) for CID ({})", [call.inputs.cid]);
  
  let batchCID = call.inputs.cid;
  let batch = AnnotationBatch.load(batchCID);
  if (batch == null) {
    batch = new AnnotationBatch(batchCID);
    batch.cid = batchCID;
  }

  // get content property from AnnotationBatch object from ipfs and try to parse it as a JSON array  
  let batchCredentialSubjectJSON = getCredentialSubjectOfCID(batchCID);
  if (batchCredentialSubjectJSON == null) { return; }
  let batchContentJSON = batchCredentialSubjectJSON.toObject().get("content");
  if (batchContentJSON == null) {
    log.debug("No property 'content' found on object 'credentialSubject' for CID ({})", [batchCID]);
  }
  if (batchContentJSON.kind != JSONValueKind.ARRAY) {
    log.debug("Data found for CID ({}) on property 'content' is not an array", [batchCID]);
  }
  let batchContent = batchContentJSON.toArray();
  
  for (let i = 0; i < batchContent.length; i++) {
    let annotationCID = batchContent[i].toString();
    log.debug("Processing annotation for CID ({})", [annotationCID]);

    // get content property from Annotation object from ipfs and try to parse it as a string  
    let annotationCredentialSubjectJSON = getCredentialSubjectOfCID(annotationCID);
    if (annotationCredentialSubjectJSON == null) { return; }
    let contentJSON = annotationCredentialSubjectJSON.toObject().get("content");
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
