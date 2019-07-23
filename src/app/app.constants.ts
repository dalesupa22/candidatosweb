import { Injectable } from '@angular/core';

@Injectable()
export class Configuration {
    public Server = 'https://34.201.19.114:40003/';
    public ApiUrl = '';
    public ServerWithApi = `${this.Server}${this.ApiUrl}`;
}
