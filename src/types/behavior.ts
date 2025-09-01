export type BehaviorEventType =
  | "page_view"
  | "session_start"
  | "session_end"
  | "button_click";

export type BaseBehaviorType = {
  type: BehaviorEventType;
  eventTime: Date;

  pageUrl: string;
  pageParams: string;
  pagePath: string;

  userId: string;
};

export type PageViewType = BaseBehaviorType & {
  type: "page_view";
};

export type SessionType = BaseBehaviorType & {
  type: "session_start" | "session_end";
  sessionId: string;
};

export type ButtonClickType = BaseBehaviorType & {
  type: "button_click";
  btnName: string;
};
