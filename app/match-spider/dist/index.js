"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const app_config_json_1 = __importDefault(require("../app.config.json"));
const main = async () => {
    console.log(await (0, promises_1.readFile)('./package.json', 'utf8'));
    console.log(app_config_json_1.default);
};
main().catch(console.error);
