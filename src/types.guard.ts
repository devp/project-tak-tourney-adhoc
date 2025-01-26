/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import type { TournamentType, TournamentPlayer, WinnerMethod, TournamentGroup, TournamentStatusBase, GroupTournamentStatus, KnockoutTournamentStatus, TournamentStatus, ExpectedGameSettings, TournamentInfo } from "./types.ts";
import { isGameResult } from "./playtak-api/types.guard.ts";

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
        (typeof typedObj["score"] === "undefined" ||
            typeof typedObj["score"] === "number") &&
        (typeof typedObj["games_played"] === "undefined" ||
            typeof typedObj["games_played"] === "number")
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
        (typedObj["winner"] === null ||
            isTournamentPlayer(typedObj["winner"]) as boolean ||
            Array.isArray(typedObj["winner"]) &&
            typedObj["winner"].every((e: any) =>
                isTournamentPlayer(e) as boolean
            )) &&
        (typedObj["winner_method"] === null ||
            typedObj["winner_method"] === "score" ||
            typedObj["winner_method"] === "head-to-head" ||
            typedObj["winner_method"] === "sonneborn-berger" ||
            typedObj["winner_method"] === "blitz" ||
            typedObj["winner_method"] === "all-methods-exhausted")
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
        ) &&
        (typeof typedObj["games"] === "undefined" ||
            Array.isArray(typedObj["games"]) &&
            typedObj["games"].every((e: any) =>
                isGameResult(e) as boolean
            ))
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

export function isExpectedGameSettings(obj: unknown): obj is ExpectedGameSettings {
    const typedObj = obj as ExpectedGameSettings
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["size"] === "undefined" ||
            typeof typedObj["size"] === "number") &&
        (typeof typedObj["timertime"] === "undefined" ||
            typeof typedObj["timertime"] === "number") &&
        (typeof typedObj["timerinc"] === "undefined" ||
            typeof typedObj["timerinc"] === "number") &&
        (typeof typedObj["komi"] === "undefined" ||
            typeof typedObj["komi"] === "number") &&
        (typeof typedObj["extra_time_amount"] === "undefined" ||
            typeof typedObj["extra_time_amount"] === "number") &&
        (typeof typedObj["extra_time_trigger"] === "undefined" ||
            typeof typedObj["extra_time_trigger"] === "number")
    )
}

export function isTournamentInfo(obj: unknown): obj is TournamentInfo {
    const typedObj = obj as TournamentInfo
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["name"] === "undefined" ||
            typeof typedObj["name"] === "string") &&
        (typeof typedObj["infoUrl"] === "undefined" ||
            typeof typedObj["infoUrl"] === "string") &&
        isTournamentType(typedObj["tournamentType"]) as boolean &&
        (typedObj["dateRange"] !== null &&
            typeof typedObj["dateRange"] === "object" ||
            typeof typedObj["dateRange"] === "function") &&
        typeof typedObj["dateRange"]["start"] === "string" &&
        typeof typedObj["dateRange"]["end"] === "string" &&
        Array.isArray(typedObj["players"]) &&
        typedObj["players"].every((e: any) =>
            isTournamentPlayer(e) as boolean
        ) &&
        (typeof typedObj["status"] === "undefined" ||
            isGroupTournamentStatus(typedObj["status"]) as boolean ||
            isKnockoutTournamentStatus(typedObj["status"]) as boolean) &&
        (typeof typedObj["expectedGameSettings"] === "undefined" ||
            isExpectedGameSettings(typedObj["expectedGameSettings"]) as boolean) &&
        (typeof typedObj["exceptions"] === "undefined" ||
            Array.isArray(typedObj["exceptions"]) &&
            typedObj["exceptions"].every((e: any) =>
            ((e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
                typeof e["timestamp"] === "string" &&
                (typeof e["reason"] === "undefined" ||
                    typeof e["reason"] === "string") &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                e["type"] === "ignoreGame" &&
                typeof e["gameId"] === "number" ||
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                typeof e["timestamp"] === "string" &&
                (typeof e["reason"] === "undefined" ||
                    typeof e["reason"] === "string") &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                e["type"] === "addGame" &&
                typeof e["gameId"] === "number" &&
                (e["category"] === "blitz" ||
                    e["category"] === "regular") ||
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                typeof e["timestamp"] === "string" &&
                (typeof e["reason"] === "undefined" ||
                    typeof e["reason"] === "string") &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                e["type"] === "overrideGameResult" &&
                typeof e["gameId"] === "number" &&
                (e["category"] === "blitz" ||
                    e["category"] === "regular") &&
                isGameResult(e["result"]) as boolean ||
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                typeof e["timestamp"] === "string" &&
                (typeof e["reason"] === "undefined" ||
                    typeof e["reason"] === "string") &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                e["type"] === "manualResult" &&
                Array.isArray(e["players"]) &&
                typeof e["players"][0] === "string" &&
                typeof e["players"][1] === "string" &&
                (e["category"] === "blitz" ||
                    e["category"] === "regular") &&
                isGameResult(e["result"]) as boolean)
            ))
    )
}
