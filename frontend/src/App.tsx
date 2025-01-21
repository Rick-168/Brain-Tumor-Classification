import React, { useState, useRef } from 'react';
import { Upload, Brain, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);  // Added confidence state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setConfidence(null);  // Reset confidence when a new file is selected
        setError(null);
      } else {
        setError('Please select an image file');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setConfidence(null);  // Reset confidence on drop
      setError(null);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/api/classify/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.result);
      setConfidence(response.data.confidence);  // Set confidence value
    } catch (err) {
      setError('An error occurred while processing the image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-blue-900 bg-opacity-750">
      {/* Background with brain-like pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-full h-full"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `
              radial-gradient(circle, #60A5FA 1px, transparent 1px),
              radial-gradient(circle, #60A5FA 1px, transparent 1px)
            `,
            backgroundPosition: '0 0, 20px 20px',
          }}
        >
        </div>
        <div className="absolute top-0 -left-10 w-96 h-96 opacity-30 rotate-12">
          <img
            src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=800"
            alt="Brain scan"
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>
        <div className="absolute bottom-0 -right-10 w-96 h-96 opacity-30 -rotate-12">
          <img
            src="https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?auto=format&fit=crop&w=800"
            alt="Brain scan"
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 z-10 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Brain Tumor Classification
            </h1>
            <p className="text-lg text-gray-300">
              Upload a brain MRI scan to detect the presence of tumors using advanced AI
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 backdrop-blur-lg border border-gray-300">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-indigo-400 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto mb-4 rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-indigo-400 mb-4" />
                  <p className="text-gray-600">
                    Drag and drop your MRI scan here, or click to select
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>

            {error && (
              <div className="flex items-center mt-4 text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className={`w-full mt-6 py-3 px-6 rounded-lg text-white font-semibold
                ${!selectedFile || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }
              `}
            >
              {loading ? 'Processing...' : 'Analyze Image'}
            </button>
          </div>

          {/* Result Section */}
          {result && (
            <div className="bg-white rounded-xl shadow-lg p-8 backdrop-blur-lg border border-gray-300">
              <div className="flex items-center mb-4">
                {result === 'Tumor Detected' ? (
                  <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />
                )}
                <h2 className="text-2xl font-semibold">Results</h2>
              </div>
              <p className={`text-lg ${result === 'Tumor Detected' ? 'text-red-600' : 'text-green-600'}`}>
                {result}
              </p>
              {confidence && (
                <p className="text-sm text-gray-500 mt-2">
                  Confidence: {confidence}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
