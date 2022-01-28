import OBSWebSocket from "obs-websocket-js"
import tmi, { ChatUserstate } from "tmi.js"
import * as fs from "fs"

process.on("unhandledRejection", console.error)
process.on("uncaughtException", console.error)

const dataFile = "data.json"

const data: any = fs.existsSync(dataFile)
  ? JSON.parse(fs.readFileSync(dataFile).toString())
  : {
      pointTimers: [],
    }

const config = require("../config.json")

const obs = new OBSWebSocket()

const twitch = new tmi.Client({
  identity: {
    username: config.twitchAuth.username,
    password: config.twitchAuth.token,
  },
  channels: [config.twitch],
})

twitch.on(
  "redeem",
  (
    channel: string,
    username: string,
    rewardType: "highlighted-message" | "skip-subs-mode-message" | string,
    tags: ChatUserstate
  ) => {
    console.log(rewardType)
    const item = config.pointTimers[rewardType]
    if (!item) return
  }
)

twitch.on(
  "message",
  async (
    channel: string,
    userstate: ChatUserstate,
    message: string,
    self: boolean
  ) => {
    if (self) return
    if (!userstate.mod && !userstate.badges?.broadcaster) return
    const k = Object.keys(config.setTextCommands).find((x) =>
      message.startsWith(x)
    )
    if (!k) return
    const source = config.setTextCommands[k] as string
    const content = message.slice(k.length)
    const settings = await obs.send("GetSourceSettings", {
      sourceName: source,
      sourceType: "text_gdiplus_v2",
    })
    await obs.send("SetSourceSettings", {
      sourceName: source,
      sourceType: "text_gdiplus_v2",
      sourceSettings: {
        ...settings.sourceSettings,
        text: content,
      },
    })
    console.log(`${source} -> ${content}`)
  }
)

const run = async () => {
  await obs.connect(config.obs)

  console.log("OBS 연결 성공")

  await twitch.connect()

  console.log("트위치 연결 성공")
}

run().then()
