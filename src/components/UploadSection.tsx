import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractType, UserRole, UploadFormData } from '@/types/contract';
import { cn } from '@/lib/utils';

interface UploadSectionProps {
  onAnalyze: (data: UploadFormData) => void;
  isAnalyzing: boolean;
}

const contractTypes: { value: ContractType; label: string }[] = [
  { value: 'employment', label: 'Employment Contract' },
  { value: 'rental', label: 'Rental/Lease Agreement' },
  { value: 'service', label: 'Service Agreement' },
  { value: 'nda', label: 'Non-Disclosure Agreement' },
  { value: 'sales', label: 'Sales Contract' },
  { value: 'partnership', label: 'Partnership Agreement' },
  { value: 'freelance', label: 'Freelance Contract' },
  { value: 'other', label: 'Other' },
];

const userRoles: { value: UserRole; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'other', label: 'Other' },
];

export function UploadSection({ onAnalyze, isAnalyzing }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<UploadFormData>({
    file: null,
    contractType: 'employment',
    userRole: 'employee',
    jurisdiction: '',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setFormData(prev => ({ ...prev, file }));
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setFormData(prev => ({ ...prev, file }));
      }
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    return validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx');
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (formData.file) {
      onAnalyze(formData);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <section className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Protect Yourself Before You Sign
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your contract and let our AI identify risky clauses, unfavorable terms, 
            and hidden pitfalls in seconds.
          </p>
        </div>

        <Card className="shadow-elegant animate-slide-up">
          <CardContent className="p-6 md:p-8">
            {/* File Upload Area */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-200 mb-6",
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
                formData.file && "border-risk-low bg-risk-low-bg/30"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
                accept=".pdf,.docx,.jpg,.jpeg,.png"
              />

              {formData.file ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{formData.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(formData.file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile();
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    Drop your contract here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOCX, JPG, PNG (up to 20MB)
                  </p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="contractType">Contract Type</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value: ContractType) => 
                    setFormData(prev => ({ ...prev, contractType: value }))
                  }
                >
                  <SelectTrigger id="contractType" className="bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {contractTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userRole">Your Role</Label>
                <Select
                  value={formData.userRole}
                  onValueChange={(value: UserRole) => 
                    setFormData(prev => ({ ...prev, userRole: value }))
                  }
                >
                  <SelectTrigger id="userRole" className="bg-background">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {userRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  placeholder="e.g., California, USA"
                  value={formData.jurisdiction}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))
                  }
                  className="bg-background"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity"
              disabled={!formData.file || isAnalyzing}
              onClick={handleSubmit}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Contract...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Analyze Contract
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-risk-low" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-risk-low" />
            <span>Documents not stored</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-risk-low" />
            <span>GDPR compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
}
