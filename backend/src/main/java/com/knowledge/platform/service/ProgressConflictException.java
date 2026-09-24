package com.knowledge.platform.service;

/**
 * 阅读进度保存冲突：请求携带的版本号与服务端当前版本不一致，
 * 说明另一台设备已经写入了更新的页码和书签。
 */
public class ProgressConflictException extends RuntimeException {
    public ProgressConflictException(String message) {
        super(message);
    }
}
