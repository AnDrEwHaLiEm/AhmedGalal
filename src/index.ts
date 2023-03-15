import express from 'express';
import cors from 'cors';
import fs from "fs";

import {
  buildGenerationRequest,
  executeGenerationRequest,
  onGenerationComplete,
} from "./helpers";


import * as Generation from "./generation/generation_pb";
import { GenerationServiceClient } from "./generation/generation_pb_service";
import { grpc as GRPCWeb } from "@improbable-eng/grpc-web";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
require('dotenv/config');
// This is a NodeJS-specific requirement - browsers implementations should omit this line.
GRPCWeb.setDefaultTransport(NodeHttpTransport());

// Authenticate using your API key, don't commit your key to a public repository!
const metadata = new GRPCWeb.Metadata();

console.log(process.env.API_KEY)

metadata.set("Authorization", "Bearer " + process.env.API_KEY);

// Create a generation client to use with all future requests
const client = new GenerationServiceClient("https://grpc.stability.ai", {});

console.log(client);


const request = buildGenerationRequest("stable-diffusion-512-v2-1", {
  type: "text-to-image",
  prompts: [
    {
      text: "Egypt",
    },
  ],
  width: 512,
  height: 512,
  samples: 1,
  cfgScale: 13,
  steps: 25,
  sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
});

executeGenerationRequest(client, request, metadata)
  .then(onGenerationComplete)
  .catch((error) => {
    console.error("Failed to make text-to-image request:", error);
  });


const app = express();
app.use(express.json());
app.use(cors());








app.listen(process.env.PORT || 4000, async () => {
  try {
    console.log('http://localhost:4000');
  } catch (error) {
    console.log(error);
  }
});

export default app;
