import { DeployedContract } from "./I_DeployedContracts";
import { writeFileSync, existsSync, readFileSync } from "fs";
const { exec } = require('child_process');

export const saveDeployedContracts = (contracts: DeployedContract[]) => {
  writeFileSync("deployedContracts.json", JSON.stringify(contracts));
};

export const verifyContracts = () => {
    if (existsSync('deployedContracts.json')) {
        const deployedContracts = JSON.parse(readFileSync('deployedContracts.json').toString()) as DeployedContract[];
        deployedContracts.forEach(contract => {
            exec(`yarn verifyContract ${contract.contractAddress} ${contract.deploymentParams.join(' ')}`, (err:any, stdout:any, stderr:any) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err)
                  return;
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
              });
        })
    }else{
        console.error("Deployed file not found !!");
    }
}