import { Button, Checkbox, Input, Select, Space } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { useEffect, useState } from 'react';

export interface EnvPreset {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'input';
  required?: boolean; // 是否必填
  options?: Array<{ label: string; value: string }>;
}

interface EnvPresetsEditorProps {
  value?: EnvPreset[];
  onChange?: (value: EnvPreset[]) => void;
}

function EnvPresetsEditor({ value = [], onChange }: EnvPresetsEditorProps) {
  const [presets, setPresets] = useState<EnvPreset[]>(value);

  // 当外部 value 变化时同步到内部状态
  useEffect(() => {
    setPresets(value);
  }, [value]);

  const handleAddPreset = () => {
    const newPreset: EnvPreset = {
      key: '',
      label: '',
      type: 'select',
      options: [{ label: '', value: '' }],
    };
    const newPresets = [...presets, newPreset];
    setPresets(newPresets);
    onChange?.(newPresets);
  };

  const handleRemovePreset = (index: number) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    onChange?.(newPresets);
  };

  const handlePresetChange = (
    index: number,
    field: keyof EnvPreset,
    val: string | boolean | EnvPreset['type'] | EnvPreset['options'],
  ) => {
    const newPresets = [...presets];
    newPresets[index] = { ...newPresets[index], [field]: val };
    setPresets(newPresets);
    onChange?.(newPresets);
  };

  const handleAddOption = (presetIndex: number) => {
    const newPresets = [...presets];
    if (!newPresets[presetIndex].options) {
      newPresets[presetIndex].options = [];
    }
    newPresets[presetIndex].options?.push({ label: '', value: '' });
    setPresets(newPresets);
    onChange?.(newPresets);
  };

  const handleRemoveOption = (presetIndex: number, optionIndex: number) => {
    const newPresets = [...presets];
    newPresets[presetIndex].options = newPresets[presetIndex].options?.filter(
      (_, i) => i !== optionIndex,
    );
    setPresets(newPresets);
    onChange?.(newPresets);
  };

  const handleOptionChange = (
    presetIndex: number,
    optionIndex: number,
    field: 'label' | 'value',
    val: string,
  ) => {
    const newPresets = [...presets];
    if (newPresets[presetIndex].options) {
      newPresets[presetIndex].options![optionIndex][field] = val;
      setPresets(newPresets);
      onChange?.(newPresets);
    }
  };

  return (
    <div className="space-y-4">
      {presets.map((preset, presetIndex) => (
        <div
          key={`preset-${preset.key || presetIndex}`}
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
                onChange={(val) => handlePresetChange(presetIndex, 'key', val)}
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
                onChange={(val) => handlePresetChange(presetIndex, 'type', val)}
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

            {(preset.type === 'select' || preset.type === 'multiselect') && (
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-2">选项：</div>
                {preset.options?.map((option, optionIndex) => (
                  <div
                    key={`option-${option.value || optionIndex}`}
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

      <Button type="dashed" long icon={<IconPlus />} onClick={handleAddPreset}>
        添加环境预设
      </Button>
    </div>
  );
}

export default EnvPresetsEditor;
