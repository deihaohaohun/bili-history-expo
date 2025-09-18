// scripts/update-env.mjs
import fs from "fs";
import os from "os";
import path from "path";

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address; // 只取一个外网可用的 IPv4
      }
    }
  }
  return "127.0.0.1"; // fallback
}

function updateEnvFile(ip) {
  const envPath = path.resolve(process.cwd(), ".env");
  let content = "";

  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf-8");
    if (content.includes("EXPO_PUBLIC_LOCAL_IP=")) {
      // 已存在则替换
      content = content.replace(
        /EXPO_PUBLIC_LOCAL_IP=.*/g,
        `EXPO_PUBLIC_LOCAL_IP=${ip}`
      );
    } else {
      // 不存在则追加
      content += `\nEXPO_PUBLIC_LOCAL_IP=${ip}\n`;
    }
  } else {
    // 不存在就新建
    content = `EXPO_PUBLIC_LOCAL_IP=${ip}\n`;
  }

  fs.writeFileSync(envPath, content, "utf-8");
  console.log(`✅ EXPO_PUBLIC_LOCAL_IP 已更新到 .env: ${ip}`);
}

const ip = getLocalIP();
updateEnvFile(ip);
