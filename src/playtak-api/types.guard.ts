/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import type { GameResultType, GameResult, GameListResponse } from "./types.ts";

export function isGameResultType(obj: unknown): obj is GameResultType {
    const typedObj = obj as GameResultType
    return (
        (typedObj === "R-0" ||
            typedObj === "0-R" ||
            typedObj === "F-0" ||
            typedObj === "0-F" ||
            typedObj === "1/2-1/2" ||
            typedObj === "1-0" ||
            typedObj === "0-1" ||
            typedObj === "0-0")
    )
}

export function isGameResult(obj: unknown): obj is GameResult {
    const typedObj = obj as GameResult
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["id"] === "number" &&
        typeof typedObj["date"] === "number" &&
        typeof typedObj["size"] === "number" &&
        typeof typedObj["player_white"] === "string" &&
        typeof typedObj["player_black"] === "string" &&
        typeof typedObj["notation"] === "string" &&
        isGameResultType(typedObj["result"]) as boolean &&
        typeof typedObj["timertime"] === "number" &&
        typeof typedObj["timerinc"] === "number" &&
        typeof typedObj["rating_white"] === "number" &&
        typeof typedObj["rating_black"] === "number" &&
        (typedObj["unrated"] === 0 ||
            typedObj["unrated"] === 1) &&
        (typedObj["tournament"] === 0 ||
            typedObj["tournament"] === 1 ||
            typedObj["tournament"] === 2) &&
        typeof typedObj["komi"] === "number" &&
        typeof typedObj["pieces"] === "number" &&
        typeof typedObj["capstones"] === "number" &&
        typeof typedObj["rating_change_white"] === "number" &&
        typeof typedObj["rating_change_black"] === "number" &&
        typeof typedObj["extra_time_amount"] === "number" &&
        typeof typedObj["extra_time_trigger"] === "number"
    )
}

export function isGameListResponse(obj: unknown): obj is GameListResponse {
    const typedObj = obj as GameListResponse
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["items"]) &&
        typedObj["items"].every((e: any) =>
            isGameResult(e) as boolean
        ) &&
        typeof typedObj["total"] === "number" &&
        typeof typedObj["page"] === "number" &&
        typeof typedObj["perPage"] === "number" &&
        typeof typedObj["totalPages"] === "number"
    )
}
