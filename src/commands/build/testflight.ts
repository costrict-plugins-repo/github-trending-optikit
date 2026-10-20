import { bumpIosBuildOnly } from "../version/bump.js";
import { buildFlutterIpa } from "./releases.js";
import { openIpaOutput } from "../project/open.js";
import { LoggerHelpers } from "../../utils/services/logger.js";

export { runTestflight };

async function runTestflight(disableFvm: boolean, open: boolean): Promise<void> {
  LoggerHelpers.step("Bumping iOS build number...");
  await bumpIosBuildOnly(true);

  LoggerHelpers.step("Building IPA...");
  await buildFlutterIpa(disableFvm);

  if (open) {
    await openIpaOutput();
  }
}
