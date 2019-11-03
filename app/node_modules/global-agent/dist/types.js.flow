// @flow

import {
  Socket,
} from 'net';
import {
  TLSSocket,
} from 'tls';
import {
  Agent as HttpAgent,
} from 'http';
import {
  Agent as HttpsAgent,
} from 'https';

export type ProxyConfigurationType = {|
  +authorization: string,
  +hostname: string,
  +port: number,
|};

export type ConnectionConfigurationType = {|
  +host: string,
  +port: number,
  +proxy: ProxyConfigurationType,
|};

export type ConnectionCallbackType = (error: Error | null, socket?: Socket | TLSSocket) => void;

export type AgentType = HttpAgent | HttpsAgent;
export type IsProxyConfiguredMethodType = () => boolean;
export type MustUrlUseProxyMethodType = (url: string) => boolean;
export type GetUrlProxyMethodType = (url: string) => ProxyConfigurationType;
export type ProtocolType = 'http:' | 'https:';

export type ProxyAgentConfigurationInputType = {|
  +environmentVariableNamespace?: string,
  +forceGlobalAgent?: boolean,
  +socketConnectionTimeout?: number,
|};

export type ProxyAgentConfigurationType = {|
  +environmentVariableNamespace: string,
  +forceGlobalAgent: boolean,
  +socketConnectionTimeout: number,
|};
