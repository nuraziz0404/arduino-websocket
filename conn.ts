import { Knex, knex } from "knex";

export class connection {
  conn: Knex;
  constructor() {
    this.conn = knex({
      client: "mysql",
      connection: {
        host: "sql6.freemysqlhosting.net",
        port: 3306,
        user: "sql6471859",
        password: "szjxRpGaqv",
        database: "sql6471859",
      },
    });
  }
}

let { conn } = new connection();

export function updateState(id: string, state: string) {
  conn("state")
    .insert({
      id: id,
      state: state,
    })
    .onConflict("id")
    .merge()
    .then((e) => {})
    .catch(console.log)
}
export function updateWeather(id: string, weather: string) {
  conn("state")
    .insert({
      id: id,
      weather: weather,
    })
    .onConflict("id")
    .merge()
    .then((e) => {})
    .catch(console.log)
}

export function cekState(id:string):Promise<Array<{id:string; state:string; weather:string}>|"err">{
  return new Promise(resolve=>{
    conn("state").where("id", "=", id)
    .then(resolve)
    .catch(e=>{
      console.log(e)
      resolve("err")
    })
  })
}
