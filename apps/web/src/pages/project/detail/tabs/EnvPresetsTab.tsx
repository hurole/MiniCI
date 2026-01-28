import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  Space,
} from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { useEffect, useState } from 'react';
import type { EnvPreset } from './types';

interface EnvPresetsTabProps {
  envPresets: EnvPreset[];
  setEnvPresets: (presets: EnvPreset[]) => void;
  envPresetsLoading: boolean;
  handleSaveEnvPresets: () => void;
}

export function EnvPresetsTab({
  envPresets: initialEnvPresets,
  setEnvPresets,
  envPresetsLoading,
  handleSaveEnvPresets,
}: EnvPresetsTabProps) {
  const [presets, setPresets] = useState<EnvPreset[]>(() => initialEnvPresets);

  useEffect(() => {
    setPresets(initialEnvPresets);
  }, [initialEnvPresets]);

  const handleAddPreset = () => {
    const newPreset: EnvPreset = {
      key: '',
      label: '',
      type: 'select',
      options: [{ label: '', value: '' }],
    };
    const newPresets = [...presets, newPreset];
    setPresets(newPresets);
    setEnvPresets(newPresets);
  };

  const handleRemovePreset = (index: number) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    setEnvPresets(newPresets);
  };

  const handlePresetChange = (
    index: number,
    field: keyof EnvPreset,
    val: string | boolean | EnvPreset['type'] | EnvPreset['options'],
  ) => {
    const newPresets = [...presets];
    newPresets[index] = { ...newPresets[index], [field]: val };
    setPresets(newPresets);
    setEnvPresets(newPresets);
  };

  const handleAddOption = (presetIndex: number) => {
    const newPresets = [...presets];
    if (!newPresets[presetIndex].options) {
      newPresets[presetIndex].options = [];
    }
    newPresets[presetIndex].options?.push({ label: '', value: '' });
    setPresets(newPresets);
    setEnvPresets(newPresets);
  };

  const handleRemoveOption = (presetIndex: number, optionIndex: number) => {
    const newPresets = [...presets];
    newPresets[presetIndex].options = newPresets[presetIndex].options?.filter(
      (_, i) => i !== optionIndex,
    );
    setPresets(newPresets);
    setEnvPresets(newPresets);
  };

  const handleOptionChange = (
    presetIndex: number,
    optionIndex: number,
    field: 'label' | 'value',
    val: string,
  ) => {
    const newPresets = [...presets];
    if (newPresets[presetIndex].options) {
      // biome-ignore lint/style/noNonNullAssertion: options is checked above
      newPresets[presetIndex].options![optionIndex][field] = val;
      setPresets(newPresets);
      setEnvPresets(newPresets);
    }
  };

  return (
    <div className="p-6">
      <Card
        title="环境变量预设"
        extra={
          <Button
            type="primary"
            onClick={handleSaveEnvPresets}
            loading={envPresetsLoading}
          >
            保存预设
          </Button>
        }
      >
        <div className="text-sm text-gray-600 mb-4">
          配置项目的环境变量预设，在部署时可以选择这些预设值。支持单选、多选和输入框类型。
        </div>
        <div className="space-y-4">
          {presets.map((preset, presetIndex) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: using index as key to prevent input focus loss when editing keys
              key={`preset-${presetIndex}`}
              className="border border-gray-200 rounded p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="font-medium text-gray-700">
                  预设项 #{presetIndex + 1}
                </div>
                <Button
                  size="small"
                  status="danger"
                  icon={<IconDelete />}
                  onClick={() => handleRemovePreset(presetIndex)}
                >
                  删除
                </Button>
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="变量名 (key)"
                    value={preset.key}
                    onChange={(val) =>
                      handlePresetChange(presetIndex, 'key', val)
                    }
                  />
                  <Input
                    placeholder="显示名称 (label)"
                    value={preset.label}
                    onChange={(val) =>
                      handlePresetChange(presetIndex, 'label', val)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    placeholder="选择类型"
                    value={preset.type}
                    onChange={(val) =>
                      handlePresetChange(presetIndex, 'type', val)
                    }
                  >
                    <Select.Option value="select">单选</Select.Option>
                    <Select.Option value="multiselect">多选</Select.Option>
                    <Select.Option value="input">输入框</Select.Option>
                  </Select>

                  <div className="flex items-center">
                    <Checkbox
                      checked={preset.required || false}
                      onChange={(checked) =>
                        handlePresetChange(presetIndex, 'required', checked)
                      }
                    >
                      必填项
                    </Checkbox>
                  </div>
                </div>

                {(preset.type === 'select' ||
                  preset.type === 'multiselect') && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-2">选项：</div>
                    {preset.options?.map((option, optionIndex) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: using index as key to prevent input focus loss when editing values
                        key={`option-${optionIndex}`}
                        className="flex items-center gap-2 mb-2"
                      >
                        <Input
                          size="small"
                          placeholder="显示文本"
                          value={option.label}
                          onChange={(val) =>
                            handleOptionChange(
                              presetIndex,
                              optionIndex,
                              'label',
                              val,
                            )
                          }
                        />
                        <Input
                          size="small"
                          placeholder="值"
                          value={option.value}
                          onChange={(val) =>
                            handleOptionChange(
                              presetIndex,
                              optionIndex,
                              'value',
                              val,
                            )
                          }
                        />
                        <Button
                          size="small"
                          status="danger"
                          icon={<IconDelete />}
                          onClick={() =>
                            handleRemoveOption(presetIndex, optionIndex)
                          }
                        />
                      </div>
                    ))}
                    <Button
                      size="small"
                      type="dashed"
                      long
                      icon={<IconPlus />}
                      onClick={() => handleAddOption(presetIndex)}
                    >
                      添加选项
                    </Button>
                  </div>
                )}
              </Space>
            </div>
          ))}

          <Button
            type="dashed"
            long
            icon={<IconPlus />}
            onClick={handleAddPreset}
          >
            添加环境预设
          </Button>
        </div>
      </Card>
    </div>
  );
}
