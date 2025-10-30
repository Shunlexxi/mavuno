import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});

export function useIPFS() {
  const upload = async (base64: string) => {
    const result = await pinata.upload.public.base64(base64);
    return {
      ...result,
      url: `ipfs://${result.cid}`,
    };
  };

  const uploadFile = async (file: File) => {
    const result = await pinata.upload.public.file(file);
    return {
      ...result,
      url: `ipfs://${result.cid}`,
    };
  };

  return { upload, uploadFile };
}
