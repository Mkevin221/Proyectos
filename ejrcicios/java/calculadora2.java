import java.util.Scanner;

public class calculadora2 {
    public static void main(String[] args) {
        Scanner gato = new Scanner(System.in);

        System.out.print("Ingresa el primer dato: ");
        int num1 = gato.nextInt();

        System.out.print("Ingresa el segundo dato: ");
        int num2 = gato.nextInt();

        System.out.print("--------------------------");
        System.out.print("--------1-suma------------");
        System.out.print("--------2-resta-----------");
        System.out.print("--------3-division--------");
        System.out.print("--------4-multiplicacion--");
        System.out.print("--------------------------");
        System.out.print("Elige una operacion: ");
        int operacion = gato.nextInt();

        int resultado = 0;

        if (operacion == 1) {
            resultado (num1 + num2);
            System.out.print("El resultado de la suma es: " + resultado);
        }

        else if (operacion == 2) {
            resultado (num1 - num2);
            System.out.print("El resultado de la resta es: " + resultado);
        }

        else if (operacion == 3) {
            resultado (num1 / num2);
            System.out.print("El resultado de la division es: " + resultado);
        }

        else if (operacion == 4) {
            resultado (num1 * num2);
            System.out.print("El resultado de la multiplicacion es: " + resultado);
        }

        gato.close();
    }
}