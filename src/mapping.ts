import { StoreCIDCall } from '../generated/CIDRegistry/CIDRegistry'
import { CID } from '../generated/schema'

export function handleStoreCID(call: StoreCIDCall): void {
  let cid = new CID(call.inputs.cid.toHex());
  cid.cid = call.inputs.cid;
  cid.save()
}
