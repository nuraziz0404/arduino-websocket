import { Knex } from "knex";
export declare class connection {
    conn: Knex;
    constructor();
}
export declare function updateState(id: string, state: string): void;
export declare function updateWeather(id: string, weather: string): void;
export declare function cekState(id: string): Promise<Array<{
    id: string;
    state: string;
    weather: string;
}> | "err">;
