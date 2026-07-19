import React from 'react';
import { Form, Input, Button, Upload, Divider } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';

const PhoneCardApplication = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-[900px] mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-800">电话卡申请</h1>
          <p className="text-sm text-gray-500 mt-1">审批单号: PCM202607190001</p>
        </div>

        <Divider className="my-4 border-gray-200" />

        {/* Application Info Section */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-blue-500 rounded-sm"></div>
          <h2 className="text-base font-bold text-slate-800 m-0">申请信息</h2>
        </div>

        <Form
          form={form}
          name="phoneCardApplication"
          onFinish={onFinish}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          {/* Reason Field */}
          <Form.Item
            label={<span className="text-sm text-slate-700">申请原因</span>}
            name="reason"
            rules={[{ required: true, message: '请输入申请原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入申请原因..." />
          </Form.Item>

          {/* ID Card Display */}
          <Form.Item label={<span className="text-sm text-slate-700">身份证号码</span>}>
            <div className="text-slate-800 py-1">420***********2433</div>
          </Form.Item>

          {/* Upload Attachment */}
          <Form.Item label={<span className="text-sm text-slate-700">上传附件</span>}>
            <Upload action="/upload.do" listType="text" maxCount={1}>
              <Button icon={<PaperClipOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>

          {/* Notices */}
          <Form.Item wrapperCol={{ offset: 4, span: 18 }} className="mb-6">
            <div className="text-red-600 text-[13px] leading-relaxed space-y-2 mt-2">
              <p className="m-0">
                由于运营商要求号码使用者需要进行实名认证，请上传您身份证正反面的扫描文件作为实名认证材料（正反面应在一页中），上传文件最大支持10M。
              </p>
              <p className="m-0">
                关于公司电话卡申领政策，请参考 <a href="#agreement" className="text-blue-600 hover:underline">《电信号码使用协议》</a>。
              </p>
              <p className="m-0">
                如对电话卡申领政策存在疑问，可咨询ES孙志强（213852），分机010-56601892。
              </p>
            </div>
          </Form.Item>

          {/* Submit */}
          <div className="flex justify-center mt-6">
            <Button
              type="primary"
              htmlType="submit"
              className="px-10 h-9 rounded text-sm tracking-widest shadow-sm"
            >
              提交
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PhoneCardApplication;
