import OBSWebSocket from "obs-websocket-js"
import tmi, { ChatUserstate } from "tmi.js"
import * as fs from "fs"

process.on("unhandledRejection", console.error)
process.on("uncaughtException", console.error)

const dataFile = "data.json"

type Data = {
  pointTimers: any[]
}

const data: Data = fs.existsSync(dataFile)
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
  async (
    channel: string,
    username: string,
    rewardType: "highlighted-message" | "skip-subs-mode-message" | string,
    tags: ChatUserstate
  ) => {
    console.log(rewardType)
    const item = config.pointTimers[rewardType]
    if (!item) return
    const pointTime = data.pointTimers.find((x) => x.id === rewardType)
    if (pointTime) {
      pointTime.time += item.minutes * 1000 * 60
    } else {
      data.pointTimers.push({
        id: rewardType,
        time: Date.now() + item.minutes * 1000 * 60,
      })
    }
    await fs.promises.writeFile(dataFile, JSON.stringify(data))
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
    if (!k) {
      const args = message.slice(1).split(" ")
      const command = args.shift()
      if (!command) return
      if (command === "시간추가") {
        const name = args.join(" ")
        const item = data.pointTimers.find(
          (x) => config.pointTimers[x.id].title === name
        )
        if (!item) return
        item.time += 1000 * 60
        await twitch.say(channel, `${name} +1분`)
      }
      return
    }
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

const formatDuration = (seconds: number) => {
  let minute = seconds / 60
  const second = seconds % 60
  const hour = minute / 60
  minute = minute % 60
  return `${
    hour >= 1
      ? Math.floor(hour).toLocaleString("en-US", {
          minimumIntegerDigits: 2,
        }) + ":"
      : ""
  }${Math.floor(minute).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  })}:${Math.floor(second).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  })}`
}

const run = async () => {
  await obs.connect(config.obs)

  console.log("OBS 연결 성공")

  await twitch.connect()

  console.log("트위치 연결 성공")

  setInterval(async () => {
    const settings = obs.send("GetSourceSettings", {
      sourceName: config.pointTimerText,
      sourceType: "text_gdiplus_v2",
    })
    let edited = false

    await obs.send("SetSourceSettings", {
      sourceName: config.pointTimerText,
      sourceType: "text_gdiplus_v2",
      sourceSettings: {
        ...settings,
        text: data.pointTimers
          .filter((x) => {
            if (x.time < Date.now()) {
              data.pointTimers = data.pointTimers.filter((y) => y.id !== x.id)
              edited = true
              return false
            }
            return config.pointTimers[x.id]
          })
          .map((x) => {
            const timer = config.pointTimers[x.id]
            const duration = formatDuration((x.time - Date.now()) / 1000)
            return `${timer.title} ${duration}`
          })
          .join("\n"),
      },
    })
    if (edited) {
      await fs.promises.writeFile(dataFile, JSON.stringify(data))
    }
  }, 1000)
}

run().then()
