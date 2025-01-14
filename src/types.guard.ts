/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import type { TournamentType, TournamentPlayer, WinnerMethod, TournamentGroup, TournamentStatusBase, GroupTournamentStatus, KnockoutTournamentStatus, TournamentStatus, TournamentInfo, TournamentInfoFromJson } from "./types.ts";

export function isTournamentType(obj: unknown): obj is TournamentType {
    const typedObj = obj as TournamentType
    return (
        (typedObj === "groupStage" ||
            typedObj === "knockoutStage")
    )
}

export function isTournamentPlayer(obj: unknown): obj is TournamentPlayer {
    const typedObj = obj as TournamentPlayer
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["username"] === "string" &&
        typeof typedObj["group"] === "string" &&
        typeof typedObj["score"] === "number" &&
        typeof typedObj["games_played"] === "number"
    )
}

export function isWinnerMethod(obj: unknown): obj is WinnerMethod {
    const typedObj = obj as WinnerMethod
    return (
        (typedObj === "score" ||
            typedObj === "head-to-head" ||
            typedObj === "sonneborn-berger" ||
            typedObj === "blitz" ||
            typedObj === "all-methods-exhausted")
    )
}

export function isTournamentGroup(obj: unknown): obj is TournamentGroup {
    const typedObj = obj as TournamentGroup
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["name"] === "string" &&
        (isTournamentPlayer(typedObj["winner"]) as boolean ||
            Array.isArray(typedObj["winner"]) &&
            typedObj["winner"].every((e: any) =>
                isTournamentPlayer(e) as boolean
            )) &&
        isWinnerMethod(typedObj["winner_method"]) as boolean
    )
}

export function isTournamentStatusBase(obj: unknown): obj is TournamentStatusBase {
    const typedObj = obj as TournamentStatusBase
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["players"]) &&
        typedObj["players"].every((e: any) =>
            isTournamentPlayer(e) as boolean
        )
    )
}

export function isGroupTournamentStatus(obj: unknown): obj is GroupTournamentStatus {
    const typedObj = obj as GroupTournamentStatus
    return (
        isTournamentStatusBase(typedObj) as boolean &&
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["tournamentType"] === "groupStage" &&
        Array.isArray(typedObj["groups"]) &&
        typedObj["groups"].every((e: any) =>
            isTournamentGroup(e) as boolean
        )
    )
}

export function isKnockoutTournamentStatus(obj: unknown): obj is KnockoutTournamentStatus {
    const typedObj = obj as KnockoutTournamentStatus
    return (
        isTournamentStatusBase(typedObj) as boolean &&
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["tournamentType"] === "knockoutStage"
    )
}

export function isTournamentStatus(obj: unknown): obj is TournamentStatus {
    const typedObj = obj as TournamentStatus
    return (
        (isGroupTournamentStatus(typedObj) as boolean ||
            isKnockoutTournamentStatus(typedObj) as boolean)
    )
}

export function isTournamentInfo(obj: unknown): obj is TournamentInfo {
    const typedObj = obj as TournamentInfo
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["name"] === "string" &&
        isTournamentType(typedObj["tournamentType"]) as boolean &&
        (typedObj["dateRange"] !== null &&
            typeof typedObj["dateRange"] === "object" ||
            typeof typedObj["dateRange"] === "function") &&
        typedObj["dateRange"]["start"] instanceof Date &&
        typedObj["dateRange"]["end"] instanceof Date &&
        Array.isArray(typedObj["players"]) &&
        typedObj["players"].every((e: any) =>
            isTournamentPlayer(e) as boolean
        ) &&
        isTournamentStatus(typedObj["status"]) as boolean
    )
}

export function isTournamentInfoFromJson(obj: unknown): obj is TournamentInfoFromJson {
    const typedObj = obj as TournamentInfoFromJson
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["name"] === "string" &&
        isTournamentType(typedObj["tournamentType"]) as boolean &&
        Array.isArray(typedObj["players"]) &&
        typedObj["players"].every((e: any) =>
            isTournamentPlayer(e) as boolean
        ) &&
        isTournamentStatus(typedObj["status"]) as boolean &&
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["dateRange"] !== null &&
            typeof typedObj["dateRange"] === "object" ||
            typeof typedObj["dateRange"] === "function") &&
        typeof typedObj["dateRange"]["start"] === "string" &&
        typeof typedObj["dateRange"]["end"] === "string"
    )
}
