import { Injectable } from '@angular/core';

@Injectable()
export class Configuration {
    public Server = 'http://40.71.189.102:40003/';
    public ApiUrl = '';
    public ServerWithApi = `${this.Server}${this.ApiUrl}`;
}
