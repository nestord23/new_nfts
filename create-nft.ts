import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

// Conectamos a la red de Solana (Devnet)
const connection = new Connection(clusterApiUrl("devnet"));

// Cargamos el keypair del usuario desde un archivo
const user = await getKeypairFromFile();

// Aseguramos que el usuario tenga suficiente SOL para pagar las transacciones
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL, // Solicita 1 SOL si el usuario no tiene fondos suficientes
  0.5 * LAMPORTS_PER_SOL // Cantidad mínima de SOL para ejecutar la transacción
);

console.log("Loaded user", user.publicKey.toBase58());

// Creamos una instancia de UMI para facilitar la gestión de transacciones
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

// Configuramos la identidad de UMI con el usuario actual
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

// Dirección de la colección a la que se agregarán los NFTs
const collectionAddress = publicKey(
  "5f24TwSEAnWdkF4mcthLfFdytq8m9koNM7oKDbxvrSg2"
);

console.log(`Creating first NFT...`);

// Se genera una nueva dirección para el primer NFT
const mint1 = generateSigner(umi);

// Se crea el primer NFT con sus metadatos
const transaction1 = await createNft(umi, {
  mint: mint1,
  name: "NFT 1", // Nombre del primer NFT
  uri: "https://raw.githubusercontent.com/nestord23/new_nfts/main/nft1.json", // Metadatos del primer NFT
  sellerFeeBasisPoints: percentAmount(0), // Regalías de 0%
  collection: {
    key: collectionAddress, // Asociación con la colección
    verified: false, // No está verificado aún
  },
});

// Enviamos y confirmamos la transacción para crear el primer NFT
await transaction1.sendAndConfirm(umi);

// Se recuperan los datos del NFT recién creado
const createdNft1 = await fetchDigitalAsset(umi, mint1.publicKey);

console.log(
  `🖼️ Created NFT 1! Address is ${getExplorerLink(
    "address",
    createdNft1.mint.publicKey,
    "devnet"
  )}`
);

console.log(`Creating second NFT...`);

// Se genera una nueva dirección para el segundo NFT
const mint2 = generateSigner(umi);

// Se crea el segundo NFT con sus metadatos
const transaction2 = await createNft(umi, {
  mint: mint2,
  name: "NFT 2", // Nombre del segundo NFT
  uri: "https://raw.githubusercontent.com/nestord23/new_nfts/main/nfts2.json", // Metadatos del segundo NFT
  sellerFeeBasisPoints: percentAmount(0), // Regalías de 0%
  collection: {
    key: collectionAddress, // Asociación con la misma colección
    verified: false, // No está verificado aún
  },
});

// Enviamos y confirmamos la transacción para crear el segundo NFT
await transaction2.sendAndConfirm(umi);

// Se recuperan los datos del segundo NFT recién creado
const createdNft2 = await fetchDigitalAsset(umi, mint2.publicKey);

console.log(
  `🖼️ Created NFT 2! Address is ${getExplorerLink(
    "address",
    createdNft2.mint.publicKey,
    "devnet"
  )}`
);

