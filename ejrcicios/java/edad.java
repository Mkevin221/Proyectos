import java.Scanner;

public class edad {
    import static void main (String[] args) {
        Scanner a = new Scanner(System.in);

        System.out.print("Ingrese su edad: ");
        int edad = a.nextInt();

        

        if (edad >= 18 ){
            System.out.print("puedes pasar. ");
        }

        else if (edad < 18 ) {
            System.out.print("no puedes pasar. ");
        }
        
        a.close();23
    }
}