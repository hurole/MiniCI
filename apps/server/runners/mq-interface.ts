// MQ集成接口设计 (暂不实现)
// 该接口用于将来通过消息队列触发流水线执行

export interface MQPipelineMessage {
  deploymentId: number;
  pipelineId: number;
  // 其他可能需要的参数
  triggerUser?: string;
  environment?: string;
}

export interface MQRunnerInterface {
  /**
   * 发送流水线执行消息到MQ
   * @param message 流水线执行消息
   */
  sendPipelineExecutionMessage(message: MQPipelineMessage): Promise<void>;

  /**
   * 监听MQ消息并执行流水线
   */
  listenForPipelineMessages(): void;

  /**
   * 停止监听MQ消息
   */
  stopListening(): void;
}
