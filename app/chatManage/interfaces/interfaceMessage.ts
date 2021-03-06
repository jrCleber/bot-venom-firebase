export interface Message {
   id: string;
   body: string;
   type: string;
   t: number;
   notifyName: string;
   from: string;
   to: string;
   fromMe: boolean;
   author: string;
   self: string;
   ack: number;
   invis: boolean;
   isNewMsg: boolean;
   star: boolean;
   recvFresh: boolean;
   interactiveAnnotations: any[];
   caption: string;
   filename: string;
   clientUrl: string;
   deprecatedMms3Url: string;
   mimetype: string;
   directPath: string;
   filehash: string;
   selectedButtonId: string;
   uploadhash: string;
   size: number;
   mediaKey: string;
   mediaKeyTimestamp: number;
   width: number;
   height: number;
   broadcast: boolean;
   mentionedJidList: any[];
   isForwarded: boolean;
   labels: any[];
   sender: Sender;
   timestamp: number;
   content: string;
   isGroupMsg: boolean;
   isMMS: boolean;
   isMedia: boolean;
   isNotification: boolean;
   isPSA: boolean;
   chat: {
      id: string;
      pendingMsgs: boolean;
      lastReceivedKey: LastReceivedKey;
      t: number;
      unreadCount: number;
      archive: boolean;
      isReadOnly: boolean;
      muteExpiration: number;
      name: string;
      notSpam: boolean;
      pin: number;
      msgs: null;
      kind: string;
      isGroup: boolean;
      contact: Sender;
      groupMetadata: null;
      presence: Presence;
   };
   lastSeen: null | number | boolean;
   chatId: string;
   quotedMsgObj: QuotedMsgList;
   mediaData: MediaData;
   listResponse: ListResponse
}
export interface ListResponse {
   title: string;
   listType: number;
   singleSelectReply: {
      selectedRowId: string
   };
   description: string
}
export interface Sections {
   title: string;
   description: string;
   rowId: string;
}
export interface List {
   sections: Sections[];
   title: string;
   description: string;
   buttonText: string;
   listType: number;
}
export interface QuotedMsgList {
   type: string;
   list: List;
}
export interface QuotedMsgButtonsResponse {
   type: string;
   beaderType: number;
   body: string;
   isDynamicReplyButtonsMsg: true;
   caption: string,
   footer: string;
   dynamicReplyButtons: ReplyButtons[]
}
export interface ReplyButtons {
   buttonId: string;
   buttonText: { displayText: string };
   type: number;
}
export interface Sender {
   id: string;
   name: string;
   shortName: string;
   pushname: string;
   type: string;
   isBusiness: boolean;
   isEnterprise: boolean;
   statusMute: boolean;
   labels: any[];
   formattedName: string;
   isMe: boolean;
   isMyContact: boolean;
   isPSA: boolean;
   isUser: boolean;
   isWAContact: boolean;
   profilePicThumbObj: ProfilePicThumbObj;
   msgs: null;
   notifyName: string;
}
export interface ProfilePicThumbObj {
   eurl: string;
   id: string;
   img: string;
   imgFull: string;
   raw: null;
   tag: string;
}
export interface LastReceivedKey {
   fromMe: boolean;
   remote: string;
   id: string;
   _serialized: string;
}
export interface Presence {
   id: string;
   chatstates: any[];
}
export interface MediaData {
   type: string;
   mediaStage: string;
   animationDuration: number;
   animatedAsNewMsg: boolean;
   _swStreamingSupported: boolean;
   _listeningToSwSupport: boolean;
}
