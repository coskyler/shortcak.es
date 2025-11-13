import { ObjectId } from "mongodb"

export interface LinkRedirect {
  _id: string //slug
  uid: string
  target: string
  name: string
  createDate: Date
  deleted: boolean
}

export interface LinkAnalytics {
  _id: string //slug
  totalClicks: number
  uniqueClicks: number
  clicksByRegion: Record<string, number>
  clicksByDevice: Record<string, number>
  clicksByReferrer: Record<string, number>
}

export interface DailyClick {
  _id?: ObjectId
  link: string
  date: Date
  clicks: number
}

export interface ClickLog {
  _id?: ObjectId
  timeStamp: Date
  link: string
  ip: string
  country?: string
  ua?: string
  referrer?: string
}

export interface UserAnalytics {
  _id: string //uid
  totalClicks: number
  clicksByRegion: Record<string, number>
  clicksByDevice: Record<string, number>
}