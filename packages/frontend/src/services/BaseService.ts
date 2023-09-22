import axios, { Axios } from "axios"

export abstract class BaseService {
  public serverURL = import.meta.env.VITE_API_SERVER_URL
  public axios: Axios

  constructor(authToken: string) {
    this.axios = axios.create({ baseURL: this.serverURL })
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }
}