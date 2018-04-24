<?php

use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \DB::table('users')->insert([
            array(
                'name' => 'dzung',
                'email' => 'buitrongdungcfc@gmail.com',
                'password' => '123456',
                'level' => 1
            ),
            array(
                'name' => 'admin',
                'email' => 'admin@saritasa.com',
                'password' => '123456',
                'level' => 2
            ),
        ]);
    }
}
