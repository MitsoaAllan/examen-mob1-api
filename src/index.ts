import * as dotenv from "dotenv";

import "module-alias/register";

import { server } from "@/server";

dotenv.config();

server();
