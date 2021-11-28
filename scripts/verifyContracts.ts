import { verifyContracts } from "./helper";

async function main() {
    verifyContracts();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  