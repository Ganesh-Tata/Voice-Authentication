import React, { useState, useCallback } from 'react';
import { Upload, Mic, Brain, Shield, RotateCcw, Play, Check, X, AlertCircle } from 'lucide-react';

interface AudioFile {
  id: string;
  name: string;
  speaker: string;
  file: File;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
}

interface AuthResult {
  fileName: string;
  trueSpeaker: string;
  predictedSpeaker: string;
  confidence: number;
  isCorrect: boolean;
}

type ModelStatus = 'not-trained' | 'training' | 'trained' | 'error';
type ClassifierType = 'SVM' | 'KNN';

function App() {
  const [enrollmentFiles, setEnrollmentFiles] = useState<AudioFile[]>([]);
  const [testFiles, setTestFiles] = useState<AudioFile[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('not-trained');
  const [classifierType, setClassifierType] = useState<ClassifierType>('SVM');
  const [authResults, setAuthResults] = useState<AuthResult[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const extractSpeakerName = (fileName: string): string => {
    return fileName.split('_')[0] || fileName.split('.')[0];
  };

  const handleFileUpload = useCallback((files: FileList | null, type: 'enrollment' | 'test') => {
    if (!files) return;

    const newFiles: AudioFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      speaker: extractSpeakerName(file.name),
      file,
      status: 'uploaded'
    }));

    if (type === 'enrollment') {
      setEnrollmentFiles(prev => [...prev, ...newFiles]);
    } else {
      setTestFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'enrollment' | 'test') => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files, type);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const trainModel = async () => {
    if (enrollmentFiles.length < 2) {
      setModelStatus('error');
      return;
    }

    setModelStatus('training');
    
    // Simulate training process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const uniqueSpeakers = new Set(enrollmentFiles.map(f => f.speaker));
    if (uniqueSpeakers.size < 2) {
      setModelStatus('error');
      return;
    }

    setModelStatus('trained');
  };

  const authenticate = async () => {
    if (modelStatus !== 'trained' || testFiles.length === 0) return;

    setIsAuthenticating(true);
    setAuthResults([]);

    // Simulate authentication process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results: AuthResult[] = testFiles.map(file => {
      const trueSpeaker = file.speaker;
      const predictedSpeaker = Math.random() > 0.3 ? trueSpeaker : enrollmentFiles[Math.floor(Math.random() * enrollmentFiles.length)].speaker;
      const confidence = Math.random() * 40 + 60; // 60-100%
      
      return {
        fileName: file.name,
        trueSpeaker,
        predictedSpeaker,
        confidence,
        isCorrect: trueSpeaker === predictedSpeaker
      };
    });

    setAuthResults(results);
    setIsAuthenticating(false);
  };

  const reset = () => {
    setEnrollmentFiles([]);
    setTestFiles([]);
    setModelStatus('not-trained');
    setAuthResults([]);
    setIsAuthenticating(false);
  };

  const removeFile = (id: string, type: 'enrollment' | 'test') => {
    if (type === 'enrollment') {
      setEnrollmentFiles(prev => prev.filter(f => f.id !== id));
    } else {
      setTestFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const FileUploadZone = ({ type, files }: { type: 'enrollment' | 'test', files: AudioFile[] }) => (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200 bg-gradient-to-br from-gray-50 to-white"
      onDrop={(e) => handleDrop(e, type)}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-blue-100 rounded-full">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload {type === 'enrollment' ? 'Enrollment' : 'Test'} Audio Files
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop WAV files here, or click to browse
          </p>
          <input
            type="file"
            multiple
            accept=".wav,.mp3,.m4a"
            className="hidden"
            id={`${type}-upload`}
            onChange={(e) => handleFileUpload(e.target.files, type)}
          />
          <label
            htmlFor={`${type}-upload`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Choose Files
          </label>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3">
                <Mic className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">Speaker: {file.speaker}</span>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id, type)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const getModelStatusColor = () => {
    switch (modelStatus) {
      case 'trained': return 'text-green-600';
      case 'training': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getModelStatusText = () => {
    switch (modelStatus) {
      case 'trained': return 'Model Trained Successfully';
      case 'training': return 'Training Model...';
      case 'error': return 'Training Failed';
      default: return 'Model Not Trained';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voice Authentication System</h1>
              <p className="text-gray-600">Advanced speaker recognition and verification</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mic className="w-5 h-5 mr-2 text-blue-600" />
              Enrollment Phase
            </h2>
            <FileUploadZone type="enrollment" files={enrollmentFiles} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2 text-purple-600" />
              Test Phase
            </h2>
            <FileUploadZone type="test" files={testFiles} />
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-green-600" />
            Model Training & Authentication
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classifier Type
              </label>
              <select
                value={classifierType}
                onChange={(e) => setClassifierType(e.target.value as ClassifierType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={modelStatus === 'training'}
              >
                <option value="SVM">Support Vector Machine</option>
                <option value="KNN">K-Nearest Neighbors</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Status
              </label>
              <div className={`flex items-center ${getModelStatusColor()}`}>
                {modelStatus === 'training' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />}
                {modelStatus === 'trained' && <Check className="w-4 h-4 mr-2" />}
                {modelStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                <span className="text-sm font-medium">{getModelStatusText()}</span>
              </div>
            </div>
            
            <button
              onClick={trainModel}
              disabled={enrollmentFiles.length < 2 || modelStatus === 'training'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {modelStatus === 'training' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Training...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Train Model
                </>
              )}
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={authenticate}
                disabled={modelStatus !== 'trained' || testFiles.length === 0 || isAuthenticating}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Authenticate
                  </>
                )}
              </button>
              
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                title="Reset All"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {authResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Authentication Results
            </h2>
            
            <div className="space-y-4">
              {authResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  result.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        result.isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {result.isCorrect ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{result.fileName}</div>
                        <div className="text-sm text-gray-600">
                          True: <span className="font-medium">{result.trueSpeaker}</span> | 
                          Predicted: <span className="font-medium">{result.predictedSpeaker}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        result.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.confidence.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Confidence</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Accuracy:</span>
                <span className="text-lg font-bold text-blue-600">
                  {((authResults.filter(r => r.isCorrect).length / authResults.length) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;