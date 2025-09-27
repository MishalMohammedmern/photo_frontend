import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image, QrCode, Download, CheckCircle, AlertCircle, Camera } from 'lucide-react';

const PhotoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is PNG
      if (file.type !== 'image/png') {
        setMessage({ type: 'error', text: 'Only PNG files are allowed' });
        return;
      }

      setSelectedFile(file);
      setMessage({ type: '', text: '' });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a PNG file first' });
      return;
    }

    setIsUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const response = await fetch('https://photo-backend-r7yh.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedFile(data.file);
        setMessage({ type: 'success', text: 'File uploaded successfully!' });

        // Generate QR code for the download URL
        try {
          const qrDataUrl = await QRCode.toDataURL(data.file.downloadUrl, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeUrl(qrDataUrl);
        } catch (qrError) {
          console.error('QR code generation error:', qrError);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadedFile(null);
    setQrCodeUrl('');
    setMessage({ type: '', text: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (uploadedFile) {
      window.open(uploadedFile.downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Upload & QR Generator</h1>
          <p className="text-gray-600">Upload your PNG images and get instant QR codes for sharing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Photo
              </CardTitle>
              <CardDescription>
                Select a PNG image file to upload and generate a QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Click to select a PNG file</p>
                  <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                </label>
              </div>

              {selectedFile && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected file:</p>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {previewUrl && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-48 object-contain mx-auto rounded-lg border"
                  />
                </div>
              )}

              {message.text && (
                <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code & Download
              </CardTitle>
              <CardDescription>
                Scan the QR code to download your uploaded image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedFile ? (
                <>
                  <div className="text-center space-y-4">
                    <div className="bg-white p-4 rounded-lg border inline-block">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your phone to download the image
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">File Details:</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Filename:</strong> {uploadedFile.filename}</p>
                      <p><strong>Original Name:</strong> {uploadedFile.originalName}</p>
                      <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      <p><strong>Uploaded:</strong> {new Date(uploadedFile.uploadedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownload}
                    className="w-full bg-green-500 hover:bg-green-600 text-white transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Direct link: <br />
                      <a
                        href={uploadedFile.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                      >
                        {uploadedFile.downloadUrl}
                      </a>
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Upload an image to generate QR code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">How it works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium">1. Upload</p>
                  <p className="text-gray-600">Select and upload your PNG image</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium">2. Generate</p>
                  <p className="text-gray-600">QR code is automatically created</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <Download className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium">3. Share</p>
                  <p className="text-gray-600">Scan QR code to download on any device</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
