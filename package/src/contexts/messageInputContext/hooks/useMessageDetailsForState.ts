import { useEffect, useState } from 'react';

import type { AudioReturnType, RecordingStatus } from '../../../native';
import type { DefaultStreamChatGenerics, FileUpload, ImageUpload } from '../../../types/types';
import { generateRandomId } from '../../../utils/utils';

import type { MessageInputContextValue } from '../MessageInputContext';

export const useMessageDetailsForState = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>(
  message: MessageInputContextValue<StreamChatGenerics>['editing'],
  initialValue?: string,
) => {
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [numberOfUploads, setNumberOfUploads] = useState(0);
  const [showMoreOptions, setShowMoreOptions] = useState(true);
  const [showVoiceUI, setShowVoiceUI] = useState(false);
  const [recording, setRecording] = useState<AudioReturnType | string | undefined>(undefined);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus | undefined>(undefined);

  const initialTextValue = initialValue || '';
  const [text, setText] = useState(initialTextValue);

  useEffect(() => {
    if (text !== initialTextValue) {
      setShowMoreOptions(false);
    }
  }, [text]);

  const messageValue =
    message === undefined ? '' : `${message.id}${message.text}${message.updated_at}`;

  useEffect(() => {
    if (message && Array.isArray(message?.mentioned_users)) {
      const mentionedUsers = message.mentioned_users.map((user) => user.id);
      setMentionedUsers(mentionedUsers);
    }
  }, [messageValue]);

  useEffect(() => {
    if (message) {
      setText(message?.text || '');
      const newFileUploads: FileUpload[] = [];
      const newImageUploads: ImageUpload[] = [];

      const attachments = Array.isArray(message.attachments) ? message.attachments : [];

      for (const attachment of attachments) {
        if (attachment.type === 'file') {
          const id = generateRandomId();
          newFileUploads.push({
            file: {
              mimeType: attachment.mime_type,
              name: attachment.title || '',
              size: attachment.file_size,
            },
            id,
            state: 'finished',
            url: attachment.asset_url,
          });
        } else if (attachment.type === 'image') {
          const id = generateRandomId();
          newImageUploads.push({
            file: {
              name: attachment.fallback,
              size: attachment.file_size,
              type: attachment.type,
            },
            id,
            state: 'finished',
            url: attachment.image_url || attachment.asset_url || attachment.thumb_url,
          });
        } else if (attachment.type === 'video') {
          const id = generateRandomId();
          newFileUploads.push({
            file: {
              mimeType: attachment.mime_type,
              name: attachment.title || '',
              size: attachment.file_size,
            },
            id,
            state: 'finished',
            thumb_url: attachment.thumb_url,
            url: attachment.asset_url,
          });
        }
      }
      if (newFileUploads.length) {
        setFileUploads(newFileUploads);
      }
      if (newImageUploads.length) {
        setImageUploads(newImageUploads);
      }
    }
  }, [messageValue]);

  return {
    fileUploads,
    imageUploads,
    mentionedUsers,
    numberOfUploads,
    recording,
    recordingStatus,
    setFileUploads,
    setImageUploads,
    setMentionedUsers,
    setNumberOfUploads,
    setRecording,
    setRecordingStatus,
    setShowMoreOptions,
    setShowVoiceUI,
    setText,
    showMoreOptions,
    showVoiceUI,
    text,
  };
};
