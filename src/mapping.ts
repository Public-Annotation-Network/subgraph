import { StoreCIDCall } from '../generated/CIDRegistry/CIDRegistry'
import { CID } from '../generated/schema'

export function handleStoreCID(call: StoreCIDCall): void {
  let cid = new CID(call.inputs._cid);
  cid.cid = call.inputs._cid;
  cid.save()
}
