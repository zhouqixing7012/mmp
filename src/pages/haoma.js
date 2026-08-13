import React, { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
  Upload,
  message as antdMessage,
} from 'antd';
import { Paperclip, UploadCloud } from 'lucide-react';
import DetailGrid, { DetailItem } from '../components/DetailGrid';

const { TextArea } = Input;

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

export default function ContractNumberApplicationPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [fileList, setFileList] = useState([]);

  const submit = (values) => {
    messageApi.success('合约号码申请已提交');
    console.log('Contract number application submitted:', { ...values, attachments: fileList });
  };

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">合约号码申请</Typography.Title>
          <Typography.Text type="secondary">申请单号：PCM202607190001</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请信息</SectionTitle>}>
          <Form form={form} layout="vertical" onFinish={submit}>
            <DetailGrid>
              <DetailItem label="身份证号码" span={3}>420***********2433</DetailItem>
              <DetailItem label="申请原因" span={3}>
                <Form.Item
                  name="reason"
                  className="mb-0"
                  rules={[{ required: true, message: '请输入申请原因' }]}
                >
                  <TextArea rows={3} maxLength={400} showCount placeholder="请输入申请原因" />
                </Form.Item>
              </DetailItem>
              <DetailItem label="上传附件" span={3}>
                <Upload
                  fileList={fileList}
                  maxCount={1}
                  beforeUpload={(file) => {
                    if (file.size > 10 * 1024 * 1024) {
                      messageApi.warning('附件大小不能超过10M');
                      return Upload.LIST_IGNORE;
                    }
                    setFileList([file]);
                    return false;
                  }}
                  onRemove={() => {
                    setFileList([]);
                    return true;
                  }}
                >
                  <Button icon={<UploadCloud size={14} />}>上传附件</Button>
                </Upload>
              </DetailItem>
            </DetailGrid>

            <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-[13px] leading-6 text-red-600">
              <div>由于运营商要求号码使用者需要进行实名认证，请上传身份证正反面的扫描文件作为实名认证材料（正反面应在一页中），上传文件最大支持10M。</div>
              <div>
                关于公司电话卡申领政策，请参考
                <Button type="link" size="small" className="px-1 align-baseline">《电信号码使用协议》</Button>。
              </div>
              <div>如对电话卡申领政策存在疑问，可咨询ES孙志强（213852），分机010-56601892。</div>
            </div>

            <div className="mt-5 flex justify-center">
              <Button type="primary" htmlType="submit">提交</Button>
            </div>
          </Form>
        </Card>
      </Space>
    </>
  );
}
