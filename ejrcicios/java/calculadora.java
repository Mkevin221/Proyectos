import java.util.Scanner;

public class calculadora {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.print("Ingrese un numero: ");
        int numero1 = input.nextInt();

        System.out.print("Ingrese un segundo numero: ");
        int numero2 = input.nextInt();

        System.out.print("elige 1 para sumar, 2 para restar, 3 para dividir, 4 para multiplicar ");
        int operacion = input.nextInt();

        int resultado;

        if (operacion == 1 ) {
            resultado = (numero1 + numero2);
            System.out.print("Resultado de la suma es: "  + resultado);
        }

        else if (operacion == 2) {
            resultado = (numero1 - numero2);
            System.out.print("Resultado de la resta es: " + resultado);
        }

        else if (operacion == 3) {
            resultado = (numero1 / numero2);
            System.out.print("Resultado de la Division es: " + resultado);
        }

        else if (operacion == 4) {
            resultado = (numero1 * numero2);
            System.out.print("Resultado de la multiplicacion es: " + resultado);
        }

        input.close();
    }
}
