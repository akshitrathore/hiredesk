import { pdf, type DocumentProps } from "@react-pdf/renderer";
import {
  NdaDocument,
  OfferLetterDocument,
  type OfferDocumentInput,
} from "@/lib/documents/templates";

async function toBuffer(document: React.ReactElement<DocumentProps>) {
  const blob = await pdf(document).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}

export async function renderOfferLetter(input: OfferDocumentInput) {
  return toBuffer(<OfferLetterDocument input={input} />);
}

export async function renderNda(input: OfferDocumentInput) {
  return toBuffer(<NdaDocument input={input} />);
}
