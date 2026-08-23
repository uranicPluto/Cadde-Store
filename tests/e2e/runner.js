const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { ensureServerReady, TEST_PORT, BASE_URL } = require("./harness");
const { runTier1Tests } = require("./tier1-features.test");
const { runTier2Tests } = require("./tier2-boundary.test");
const { runTier3Tests } = require("./tier3-pairwise.test");
const { runTier4Tests } = require("./tier4-scenarios.test");

async function checkServerAlive() {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function startServerIfNeeded() {
  const isAlive = await checkServerAlive();
  if (isAlive) {
    console.log(`[E2E Runner] Target server already running at ${BASE_URL}.`);
    return { process: null, wasSpawned: false };
  }

  console.log(`[E2E Runner] Starting Next.js test server on port ${TEST_PORT}...`);
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "npx.cmd" : "npx";
  const serverProcess = spawn(cmd, ["next", "dev", "-p", String(TEST_PORT)], {
    cwd: path.join(__dirname, "..", ".."),
    stdio: "ignore",
    shell: true,
  });

  await ensureServerReady(60000);
  console.log(`[E2E Runner] Test server ready at ${BASE_URL}.`);
  return { process: serverProcess, wasSpawned: true };
}

async function main() {
  console.log("================================================================================");
  console.log("             CADDE STORE — OPAQUE-BOX E2E TEST SUITE RUNNER                     ");
  console.log("================================================================================");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Target:    ${BASE_URL}\n`);

  const serverInfo = await startServerIfNeeded();
  const overallStart = Date.now();

  try {
    // 1. Run Tier 1
    const tier1Results = await runTier1Tests();
    const t1Passed = tier1Results.filter((r) => r.status === "PASSED").length;
    const t1Failed = tier1Results.filter((r) => r.status === "FAILED").length;

    // 2. Run Tier 2
    const tier2Results = await runTier2Tests();
    const t2Passed = tier2Results.filter((r) => r.status === "PASSED").length;
    const t2Failed = tier2Results.filter((r) => r.status === "FAILED").length;

    // 3. Run Tier 3
    const tier3Results = await runTier3Tests();
    const t3Passed = tier3Results.filter((r) => r.status === "PASSED").length;
    const t3Failed = tier3Results.filter((r) => r.status === "FAILED").length;

    // 4. Run Tier 4
    const tier4Results = await runTier4Tests();
    const t4Passed = tier4Results.filter((r) => r.status === "PASSED").length;
    const t4Failed = tier4Results.filter((r) => r.status === "FAILED").length;

    const allResults = [
      ...tier1Results,
      ...tier2Results,
      ...tier3Results,
      ...tier4Results,
    ];

    const totalTests = allResults.length;
    const totalPassed = allResults.filter((r) => r.status === "PASSED").length;
    const totalFailed = allResults.filter((r) => r.status === "FAILED").length;
    const totalDuration = Date.now() - overallStart;

    console.log("\n================================================================================");
    console.log("                           E2E TEST EXECUTION SUMMARY                           ");
    console.log("================================================================================");
    console.log(`  Tier 1 (Feature Coverage):     ${t1Passed}/${tier1Results.length} passed (${t1Failed} failed)`);
    console.log(`  Tier 2 (Boundary & Corner):    ${t2Passed}/${tier2Results.length} passed (${t2Failed} failed)`);
    console.log(`  Tier 3 (Pairwise Cross-Flow):  ${t3Passed}/${tier3Results.length} passed (${t3Failed} failed)`);
    console.log(`  Tier 4 (Real-World Scenarios): ${t4Passed}/${tier4Results.length} passed (${t4Failed} failed)`);
    console.log("--------------------------------------------------------------------------------");
    console.log(`  TOTAL:                         ${totalPassed}/${totalTests} passed (${totalFailed} failed) in ${(totalDuration / 1000).toFixed(2)}s`);
    console.log("================================================================================\n");

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        passRate: `${((totalPassed / totalTests) * 100).toFixed(1)}%`,
        totalDurationMs: totalDuration,
      },
      tierSummary: {
        tier1: { total: tier1Results.length, passed: t1Passed, failed: t1Failed },
        tier2: { total: tier2Results.length, passed: t2Passed, failed: t2Failed },
        tier3: { total: tier3Results.length, passed: t3Passed, failed: t3Failed },
        tier4: { total: tier4Results.length, passed: t4Passed, failed: t4Failed },
      },
      results: allResults,
    };

    const reportPath = path.join(__dirname, "TEST_REPORT.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`[E2E Runner] Report generated successfully at: ${reportPath}`);

    if (totalFailed > 0) {
      console.log("\nFailed Test Details:");
      allResults
        .filter((r) => r.status === "FAILED")
        .forEach((r) => {
          console.log(`  - [Tier ${r.tier}] [${r.id}] ${r.name}: ${r.error}`);
        });
      process.exitCode = 1;
    } else {
      console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY WITH 100% SUCCESS RATE! <<<\n");
    }
  } finally {
    if (serverInfo.wasSpawned && serverInfo.process) {
      console.log("[E2E Runner] Shutting down spawned Next.js server...");
      try {
        if (process.platform === "win32") {
          require("child_process").execSync(`taskkill /pid ${serverInfo.process.pid} /T /F`, { stdio: "ignore" });
        } else {
          serverInfo.process.kill("SIGTERM");
        }
      } catch (e) {}
    }
  }
}

main().catch((err) => {
  console.error("[E2E Runner Fatal Error]:", err);
  process.exit(1);
});
