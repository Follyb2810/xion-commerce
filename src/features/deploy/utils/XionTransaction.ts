import { InstantiateOptions, JsonObject } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/stargate";

import {
  TransactionResult,
  ContractDeployResult,
  ContractInstantiateResult,
  IQueryContract,
  IInstanceContract,
} from "../deploy.type";
import XionWallet from "./XionWallet";
import XionConnect from "./XionConnect";
import { XionUtils } from "./XionUtils";
import { readFileSync } from "fs";

class XionTransaction {
  private readonly xionWallet: XionWallet;
  private readonly xionConnect: XionConnect;
  private readonly contractAddress: string;
  private readonly adminAddress: string;

  constructor(config?: {
    contractAddress?: string;
    adminAddress?: string;
    xionConnect?: XionConnect;
    xionWallet?: XionWallet;
  }) {
    this.xionConnect = config?.xionConnect ?? new XionConnect();
    this.xionWallet = config?.xionWallet ?? new XionWallet();
    this.contractAddress =
      config?.contractAddress ?? (process.env.CONTRACT_ADDRESS as string);
    this.adminAddress =
      config?.adminAddress ?? (process.env.ADMIN_ADDRESS as string);

    if (!this.contractAddress) {
      throw new Error("Contract address is required");
    }
    if (!this.adminAddress) {
      throw new Error("Admin address is required");
    }
  }

  async sendTokens(
    recipientAddress: string,
    amount: string,
    denom: string = "uxion",
    memo: string = ""
  ): Promise<TransactionResult> {
    if (!XionUtils.isValidXionAddress(recipientAddress)) {
      throw new Error(`Invalid recipient address: ${recipientAddress}`);
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    const client = await this.xionConnect.getSigningStargateClient();
    const senderAddress = await this.xionWallet.getMyXionAddress();

    const result = await client.sendTokens(
      senderAddress,
      recipientAddress,
      [{ denom, amount }],
      "auto",
      memo || "Transfer via XION backend"
    );

    return {
      transactionHash: result.transactionHash,
      gasUsed: result.gasUsed.toString(),
      gasWanted: result.gasWanted.toString(),
    };
  }

  async executeContract(
    msg: JsonObject,
    funds: { denom: string; amount: string }[] = [],
    mnemonic?: string
  ): Promise<TransactionResult> {
    if (!XionUtils.isValidXionAddress(this.adminAddress)) {
      throw new Error(`Invalid sender address: ${this.adminAddress}`);
    }
    if (!XionUtils.isValidXionAddress(this.contractAddress)) {
      throw new Error(`Invalid contract address: ${this.contractAddress}`);
    }

    try {
      const client = await this.xionConnect.getSigningWasmClient(mnemonic);
      const result = await client.execute(
        this.adminAddress,
        this.contractAddress,
        msg,
        "auto",
        "Execute contract via XION backend",
        funds
      );

      return {
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed.toString(),
        gasWanted: result.gasWanted.toString(),
      };
    } catch (error: any) {
      console.error("🚨 Smart Contract Execution Error:", error);
      throw new Error(`Contract execution failed: ${error.message}`);
    }
  }

  //? done
  async uploadEscrow(
    senderAddress: string = this.adminAddress,
    mnemonic?: string,
    wasmFilePath?: Uint8Array
  ): Promise<ContractDeployResult> {
    if (!XionUtils.isValidXionAddress(senderAddress)) {
      throw new Error(`Invalid sender address: ${senderAddress}`);
    }
    const WASM_FILE_PATH = "./artifacts/escrow_contract.wasm";
    const wasmCode = wasmFilePath ? wasmFilePath : readFileSync(WASM_FILE_PATH);
    console.log(`📄 Contract size: ${wasmCode.length} bytes`);
    if (!wasmCode || wasmCode.length === 0) {
      throw new Error("WASM code is required");
    }

    const client = await this.xionConnect.getSigningWasmClient(mnemonic);
    const uploadResult = await client.upload(
      senderAddress,
      wasmCode,
      "auto",
      "Escrow Contract v0.1.0"
    );

    const { codeId, transactionHash } = uploadResult;
    return { codeId, transactionHash };
  }

  async instantiateContract({
    senderAddress = this.adminAddress,
    codeId,
    msg,
    label="Escrow Contract Instance",
    fee = "auto",
    options,
    mnemonic,
  }: IInstanceContract): Promise<ContractInstantiateResult> {
    if (!XionUtils.isValidXionAddress(senderAddress)) {
      throw new Error(`Invalid sender address: ${senderAddress}`);
    }
    if (!Number.isInteger(codeId) || codeId <= 0) {
      throw new Error(`Invalid code ID: ${codeId}`);
    }
    if (!label || label.trim().length === 0) {
      throw new Error("Label is required");
    }

    const client = await this.xionConnect.getSigningWasmClient(mnemonic);
    const instantiateResult = await client.instantiate(
      senderAddress,
      codeId,
      msg,
      label.trim(),
      fee,
      {
        memo: `Instantiating ${label}`,
        admin: this.adminAddress,
        ...options,
      }
    );

    const { contractAddress, transactionHash, gasUsed } = instantiateResult;
    return { contractAddress, transactionHash, gasUsed };
  }

  async queryContract(
    msg: JsonObject,
    contractAddress: string = this.contractAddress,
  ): Promise<IQueryContract> {
    if (!XionUtils.isValidXionAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    const client = await this.xionConnect.getQueryCosmWasmClient();
    return client.queryContractSmart(contractAddress, msg);
  }

  async estimateExecutionGas(
    senderAddress: string,
    msg: JsonObject,
    funds: { denom: string; amount: string }[] = [],
    mnemonic?: string
  ) {
    if (!XionUtils.isValidXionAddress(senderAddress)) {
      throw new Error(`Invalid sender address: ${senderAddress}`);
    }

    const client = await this.xionConnect.getSigningWasmClient(mnemonic);
    return client.simulate(
      senderAddress,
      [
        {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: {
            sender: senderAddress,
            contract: this.contractAddress,
            msg: Buffer.from(JSON.stringify(msg)),
            funds,
          },
        },
      ],
      "Gas estimation"
    );
  }
}

export default XionTransaction;
