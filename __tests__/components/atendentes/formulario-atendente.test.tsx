import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormularioAtendente } from '@/components/atendentes/formulario-atendente';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Mock do hook de toast
jest.mock('@/hooks/use-toast');
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Wrapper com providers necessários
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>
    {children}
    <Toaster />
  </div>
);

describe('FormularioAtendente', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar formulário de criação corretamente', () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Novo Atendente')).toBeInTheDocument();
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
      expect(screen.getByText('Salvar')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('deve renderizar formulário de edição com dados preenchidos', () => {
      const atendenteExistente = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@empresa.com',
        cpf: '123.456.789-00',
        telefone: '(11) 99999-9999',
        data_admissao: new Date('2024-01-15'),
        status: 'ATIVO' as const,
        criado_em: new Date(),
        atualizado_em: new Date()
      };

      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="editar" 
            atendente={atendenteExistente}
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Editar Atendente')).toBeInTheDocument();
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
      expect(screen.getByDisplayValue('joao@empresa.com')).toBeInTheDocument();
      expect(screen.getByText('Atualizar')).toBeInTheDocument();
    });

    it('deve renderizar seções do formulário', () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Informações Pessoais')).toBeInTheDocument();
      expect(screen.getByText('Informações Profissionais')).toBeInTheDocument();
      expect(screen.getByText('Foto do Atendente')).toBeInTheDocument();
    });
  });

  describe('Validação', () => {
    it('deve mostrar erros de validação para campos obrigatórios', async () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      // Tentar submeter formulário vazio
      fireEvent.click(screen.getByText('Salvar'));
      
      await waitFor(() => {
        expect(screen.getByText(/nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
        expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('deve validar formato de email', async () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'email-inválido' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('deve validar formato de CPF', async () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      const cpfInput = screen.getByLabelText(/cpf/i);
      fireEvent.change(cpfInput, { target: { value: '123' } });
      fireEvent.blur(cpfInput);
      
      await waitFor(() => {
        expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
      });
    });
  });

  describe('Interações', () => {
    it('deve chamar onCancel ao clicar em Cancelar', () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      fireEvent.click(screen.getByText('Cancelar'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('deve submeter formulário com dados válidos', async () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      // Preencher campos obrigatórios
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'joao@empresa.com' }
      });
      fireEvent.change(screen.getByLabelText(/cpf/i), {
        target: { value: '123.456.789-00' }
      });
      fireEvent.change(screen.getByLabelText(/data de admissão/i), {
        target: { value: '2024-01-15' }
      });
      
      // Submeter formulário
      fireEvent.click(screen.getByText('Salvar'));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            nome: 'João Silva',
            email: 'joao@empresa.com',
            cpf: '123.456.789-00',
            dataAdmissao: '2024-01-15'
          })
        );
      });
    });

    it('deve formatar CPF automaticamente', async () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      const cpfInput = screen.getByLabelText(/cpf/i);
      fireEvent.change(cpfInput, { target: { value: '12345678900' } });
      
      await waitFor(() => {
        expect(cpfInput).toHaveValue('123.456.789-00');
      });
    });

    it('deve formatar telefone automaticamente', async () => {
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmit} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      const telefoneInput = screen.getByLabelText(/telefone/i);
      fireEvent.change(telefoneInput, { target: { value: '11999999999' } });
      
      await waitFor(() => {
        expect(telefoneInput).toHaveValue('(11) 99999-9999');
      });
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar estado de carregamento durante submissão', async () => {
      // Mock para simular delay na submissão
      const mockOnSubmitWithDelay = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmitWithDelay} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      // Preencher campos obrigatórios
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'joao@empresa.com' }
      });
      fireEvent.change(screen.getByLabelText(/cpf/i), {
        target: { value: '123.456.789-00' }
      });
      fireEvent.change(screen.getByLabelText(/data de admissão/i), {
        target: { value: '2024-01-15' }
      });
      
      // Submeter formulário
      fireEvent.click(screen.getByText('Salvar'));
      
      // Verificar estado de loading
      expect(screen.getByText('Salvando...')).toBeInTheDocument();
      
      // Aguardar conclusão
      await waitFor(() => {
        expect(screen.queryByText('Salvando...')).not.toBeInTheDocument();
      });
    });

    it('deve desabilitar botões durante carregamento', async () => {
      const mockOnSubmitWithDelay = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <TestWrapper>
          <FormularioAtendente 
            modo="criar" 
            onSubmit={mockOnSubmitWithDelay} 
            onCancel={mockOnCancel} 
          />
        </TestWrapper>
      );
      
      // Preencher e submeter
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'joao@empresa.com' }
      });
      fireEvent.change(screen.getByLabelText(/cpf/i), {
        target: { value: '123.456.789-00' }
      });
      fireEvent.change(screen.getByLabelText(/data de admissão/i), {
        target: { value: '2024-01-15' }
      });
      
      fireEvent.click(screen.getByText('Salvar'));
      
      // Verificar botões desabilitados
      expect(screen.getByText('Salvando...')).toBeDisabled();
      expect(screen.getByText('Cancelar')).toBeDisabled();
    });
  });
});